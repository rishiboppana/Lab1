from fastapi import FastAPI
from pydantic import BaseModel
from agents import planner
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

class Question(BaseModel):
    question: str
    bookingId: Optional[int] = None
    userId: Optional[int] = None
    propertyId: Optional[int] = None


@app.post("/agent")
def answer(payload: Question):
    booking_data = None

    # if payload.bookingId:
    #     booking_data = get_booking_by_id(payload.bookingId)

    # Provide booking info into the prompt if exists
    prompt = f"""
    User question: {payload.question}
    Booking Id : {payload.bookingId}
    user Id : {payload.userId}
    property Id : {payload.propertyId}
    """

    response = planner(prompt)
    return {"answer": response, "booking": booking_data}

