# tools.py
import os
import json
import datetime
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
from db import SessionLocal
from model import Bookings

load_dotenv()

# --------------------------
# 1) Tavily Web Search Tool
# --------------------------
web_search = TavilySearchResults(max_results=5)

# --------------------------
# 2) Python Calculator Tool
# --------------------------
@tool
def calculate(expression: str):
    """Evaluate a math expression like '40 + 120 / 2'."""
    return eval(expression)

# --------------------------
# 3) Python Date Tool
# --------------------------
@tool
def days_between(input_text: str):
    """
    Calculate number of days between dates.

    Priority:
    1. If input_text contains booking info (check_in, check_out), extract automatically.
    2. If two dates exist anywhere in input_text, extract via regex.
    3. If dates not available, return a neutral chatbot response.
    """
    import re
    import datetime
    import json

    # 1) Detect booking info (check_in / check_out)
    try:
        data = json.loads(input_text)
        if "check_in" in data and "check_out" in data:
            start = str(data["check_in"])
            end = str(data["check_out"])
            d1 = datetime.datetime.fromisoformat(start)
            d2 = datetime.datetime.fromisoformat(end)
            return (d2 - d1).days
    except:
        pass

    # 2) Extract dates from natural language like: “2025-10-10 to 2025-10-12”
    dates = re.findall(r"\d{4}-\d{2}-\d{2}", input_text)
    if len(dates) >= 2:
        d1 = datetime.datetime.fromisoformat(dates[0])
        d2 = datetime.datetime.fromisoformat(dates[1])
        return (d2 - d1).days

    # 3) No dates → return friendly message
    return "I could not find any dates to calculate the duration."

# --------------------------
# 4) SQL Booking Lookup Tool
# --------------------------
@tool
def get_booking_by_id(booking_id: int):
    """Fetch a booking row from the MySQL DB."""
    db = SessionLocal()
    booking = db.query(Bookings).filter(Bookings.id == booking_id).first()

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

# Export tools
tools_list = [web_search, calculate, days_between, get_booking_by_id]
