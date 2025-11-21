import json
import ollama
from typing import Optional, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from tavily import TavilyClient

from tools.booking_tool import get_booking_from_db
from tools.property_tool import get_property_from_db

tavily = TavilyClient(api_key="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")


def serialize_data(obj):
    """Convert dates, datetimes, and decimals to JSON-serializable formats."""
    if isinstance(obj, dict):
        return {k: serialize_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_data(item) for item in obj]
    elif isinstance(obj, (date, datetime)):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


def run_web_search(query: str) -> str:
    """Search the web for real-time information."""
    try:
        res = tavily.search(query=query, max_results=5)
        return "\n\n".join([
            f"Source: {r.get('title', 'Unknown')}\n{r['content']}" 
            for r in res.get("results", [])
        ])
    except Exception as e:
        return f"Search failed: {str(e)}"


def chat_agent(question: str, booking_id: Optional[int] = None) -> str:
    """
    Main agent that handles user questions about bookings, properties, and travel planning.
    
    Args:
        question: User's question
        booking_id: Optional booking ID (integer)
    
    Returns:
        Agent's response
    """
    
    # Initialize context
    context = {
        "booking": None,
        "property": None,
        "web_info": None
    }
    
    # Step 1: If booking_id provided, fetch booking data immediately
    if booking_id:
        try:
            booking_data = get_booking_from_db(booking_id)
            
            # Check for error
            if booking_data.get("error"):
                return f"I couldn't find booking with ID {booking_id}. Please check your booking reference."
            
            # Serialize dates and decimals
            context["booking"] = serialize_data(booking_data)
            print(f"✓ Loaded booking: {context['booking']}")
            
            # Also fetch property if we have property_id
            if context["booking"].get("property_id"):
                try:
                    property_data = get_property_from_db(context["booking"]["property_id"])
                    
                    # Check for error
                    if property_data.get("error"):
                        print(f"✗ Property not found")
                    else:
                        context["property"] = serialize_data(property_data)
                        print(f"✓ Loaded property: {context['property']}")
                except Exception as e:
                    print(f"✗ Error fetching property: {e}")
        except Exception as e:
            print(f"✗ Error fetching booking: {e}")
            return f"I couldn't find booking with ID {booking_id}. Please check your booking reference."
    
    # Step 2: Determine what tools are needed
    system_prompt = """You are a booking assistant. Analyze the user's question and determine what information is needed.

Available tools:
- get_booking: Get booking details (check-in, check-out, guests, property_id)
- get_property: Get property details (location, address, amenities)
- web_search: Search for real-time info (weather, attractions, events, restaurants)

Respond with JSON indicating what tools are needed:
{
  "tools_needed": ["tool_name1", "tool_name2"],
  "reasoning": "why these tools are needed",
  "search_query": "specific query for web search if needed"
}

IMPORTANT:
- If booking data is already provided, DON'T include "get_booking"
- If property data is already provided, DON'T include "get_property"
- For weather/attractions, always include "web_search"

Examples:
- "What's my booking?" → ["get_booking"]
- "Plan my trip" (with booking loaded) → ["web_search"]
- "Weather forecast" (with booking+property loaded) → ["web_search"]
"""

    context_info = ""
    if context["booking"]:
        context_info += f"\n\nBOOKING DATA ALREADY LOADED:\n{json.dumps(context['booking'], indent=2)}"
    if context["property"]:
        context_info += f"\n\nPROPERTY DATA ALREADY LOADED:\n{json.dumps(context['property'], indent=2)}"
    
    # Ask LLM what tools are needed
    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {"role": "system", "content": system_prompt + context_info},
                {"role": "user", "content": question}
            ],
            format="json"
        )
        
        plan = json.loads(response["message"]["content"])
        print(f"📋 Plan: {plan}")
    except Exception as e:
        print(f"✗ Planning error: {e}")
        return "I'm having trouble understanding your question. Could you rephrase it?"
    
    tools_needed = plan.get("tools_needed", [])
    
    # Step 3: Execute tools in sequence
    for tool in tools_needed:
        
        if tool == "get_booking" and not context["booking"]:
            if not booking_id:
                return "I need a booking ID to help you. Please provide your booking reference."
            try:
                booking_data = get_booking_from_db(booking_id)
                if booking_data.get("error"):
                    return f"I couldn't find booking {booking_id}."
                context["booking"] = serialize_data(booking_data)
                print(f"✓ Fetched booking: {context['booking']}")
            except Exception as e:
                print(f"✗ Error: {e}")
                return f"I couldn't find booking {booking_id}."
        
        elif tool == "get_property" and not context["property"]:
            # Get property_id from booking
            property_id = None
            if context["booking"]:
                property_id = context["booking"].get("property_id")
            
            if not property_id:
                return "I need property information, but no property ID is available in your booking."
            
            try:
                property_data = get_property_from_db(property_id)
                if property_data.get("error"):
                    return f"I couldn't find property {property_id}."
                context["property"] = serialize_data(property_data)
                print(f"✓ Fetched property: {context['property']}")
            except Exception as e:
                print(f"✗ Error: {e}")
                return f"I couldn't find property {property_id}."
        
        elif tool == "web_search":
            # Build smart search query
            query = plan.get("search_query", "")
            
            # Enhance query with location from property
            if context["property"]:
                location = context["property"].get("location") or context["property"].get("address", "")
                if location and location not in query:
                    query = f"{query} {location}".strip()
            
            if not query:
                query = question
            
            print(f"🔍 Searching: {query}")
            context["web_info"] = run_web_search(query)
            print(f"✓ Search complete")
    
    # Step 4: Generate final answer using all collected context
    final_system_prompt = """You are a helpful booking assistant. Answer the user's question using ONLY the provided data.

IMPORTANT RULES:
- Use ONLY the data provided in the context
- Be specific and helpful
- If creating an itinerary, include times and activities
- If planning trips, use the property location and web search results
- Be conversational and friendly
- DO NOT make up information
- If data is missing, say so clearly

Format your response in a clear, readable way."""

    final_context = {
        "question": question,
        "booking": context["booking"],
        "property": context["property"],
        "web_search_results": context["web_info"]
    }
    
    try:
        final_response = ollama.chat(
            model="llama3.2",
            messages=[
                {"role": "system", "content": final_system_prompt},
                {"role": "user", "content": json.dumps(final_context, indent=2)}
            ]
        )
        
        return final_response["message"]["content"]
    except Exception as e:
        print(f"✗ Final response error: {e}")
        return "I encountered an error generating your response. Please try again."