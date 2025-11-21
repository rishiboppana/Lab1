import json
from langchain_community.chat_models import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.tools import tool
from pydantic import BaseModel, Field
from db import SessionLocal
from model import Bookings

SYSTEM_PROMPT = """
You are a tool-enabled assistant.

Available tools:
1. web_search — for doing real-time web searches.
   Input: {"tool": "web_search", "input": "your search query here"}
   
2. get_booking — for getting booking details from database.
   Input: {"tool": "get_booking", "input": {"booking_id": 123}}

To call a tool, respond ONLY with JSON like:
{
  "tool": "tool_name",
  "input": "tool_input"
}

If no tool is needed, respond with:
{
  "response": "your normal response here"
}

Do NOT create or imagine new tools.
Use ONLY the tools listed above.
"""

@tool
def web_search_tool(query: str):
    """Search the web using Tavily."""
    try:
        search = TavilySearchResults(max_results=5)
        results = search.run(query)
        return results
    except Exception as e:
        return f"Error searching web: {str(e)}"

class GetBookingInput(BaseModel):
    """Input schema for get_booking tool"""
    booking_id: int = Field(description="The ID of the booking to retrieve")

@tool(args_schema=GetBookingInput)
def get_booking_tool(booking_id: int):
    """Get Booking details from the database.
    
    Args:
        booking_id: The ID of the booking to retrieve
    """
    db = SessionLocal()
    try:
        booking = db.query(Bookings).filter(Bookings.id == booking_id).first()

        if not booking:
            return {"error": f"No booking found with ID {booking_id}"}

        return {
            "id": booking.id,
            "property_id": booking.property_id,
            "user_id": booking.user_id,
            "check_in": str(booking.check_in),
            "check_out": str(booking.check_out),
            "total_price": float(booking.total_price) if booking.total_price else None,
            "status": booking.status,
            "guests": booking.guests,
        }
    except ValueError:
        return {"error": f"Invalid booking ID format: {booking_id}"}
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}
    finally:
        db.close()

# Register tools
TOOLS = {
    "web_search": web_search_tool,
    "get_booking": get_booking_tool
}

def planner(user_input: str):
    """
    Main planner function that processes user input and executes tools.
    
    Args:
        user_input: The user's query or request
        
    Returns:
        Either tool output or a direct response
    """
    llm = ChatOllama(
        model="llama3.2",
        temperature=0.2,
        format="json"
    )

    prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_input}"

    try:
        response = llm.invoke(prompt).content
        
        # Parse the LLM response
        data = json.loads(response)

        # Check if it's a tool call
        if "tool" in data and "input" in data:
            tool_name = data["tool"]
            tool_input = data["input"]

            if tool_name in TOOLS:
                # Execute the tool
                tool_result = TOOLS[tool_name].run(tool_input)
                
                # Format the result nicely
                return {
                    "tool_used": tool_name,
                    "tool_input": tool_input,
                    "result": tool_result
                }
            else:
                return {
                    "error": f"Unknown tool: {tool_name}",
                    "available_tools": list(TOOLS.keys())
                }
        
        # If it's a direct response
        elif "response" in data:
            return {"response": data["response"]}
        
        # Fallback for unexpected format
        else:
            return {"response": response}

    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse LLM response as JSON",
            "raw_response": response if 'response' in locals() else None,
            "details": str(e)
        }
    except Exception as e:
        return {
            "error": "Unexpected error in planner",
            "details": str(e)
        }

# Example usage
if __name__ == "__main__":
    # Test cases
    test_queries = [
        "Search for the latest news on AI",
        "Get booking details for ID 123",
        "What's the weather like today?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        result = planner(query)
        print(f"Result: {json.dumps(result, indent=2)}")