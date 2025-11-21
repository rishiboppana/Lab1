from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

from chat_agent import chat_agent

app = FastAPI()

class ChatRequest(BaseModel):
    question: str
    bookingId: Optional[int] = None


@app.post("/chat")
def chat(req: ChatRequest):
    # Pass booking_id directly, not the booking_data dict
    answer = chat_agent(req.question, req.bookingId)
    
    return {"answer": answer}