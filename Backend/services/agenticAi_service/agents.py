import json
from langchain_community.chat_models import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.tools import tool
from db import SessionLocal
from model import Bookings

SYSTEM_PROMPT = """
You are a tool-enabled assistant.

Available tools:
1. web_search — for doing real-time web searches.
2. get_booking - for getting booking details from database.
To call a tool, respond ONLY with JSON like:

TOOLS = {
    "web_search": web_search_tool,
    "get_booking": get_booking
}


If no tool is needed, respond normally.
Do NOT create or imagine new tools.
Use ONLY the tools listed above.
"""

@tool
def web_search_tool(query: str):
    """Search the web using Tavily."""
    search = TavilySearchResults(max_results=5)
    return search.run(query)

@tool
def get_booking_tool(id : int) : 
    """ Get Booking details from the database"""
    db = SessionLocal()
    booking = db.query(Bookings).filter(Bookings.id == id).first()

    if not booking:
        return "No booking found."

    return {
        "id": booking.id,
        "property_id": booking.property_id,
        "user_id": booking.user_id,
        "check_in": str(booking.check_in),
        "check_out": str(booking.check_out),
        "total_price": booking.total_price,
        "status": booking.status,
        "guests": booking.guests,
    }
# Register tools
TOOLS = {
    "web_search": web_search_tool,
    "get_booking" : get_booking_tool
}
def planner(user_input: str):
    llm = ChatOllama(
        model="llama3.2",
        temperature=0.2,
        format="json"
    )

    prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_input}"

    response = llm.invoke(prompt).content

    # Step 2 — Parse tool use
    try:
        data = json.loads(response)

        tool_name = data.get("tool")
        tool_input = data.get("input")

        if tool_name in TOOLS:
            return TOOLS[tool_name].run(tool_input)
        else:
            return f"Unknown tool: {tool_name}"

    except Exception:
        return response
