from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sys
import os
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import (
    AgentRequest,
    AgentResponse,
    BookingContext,
    Preferences,
    PartyType
)
from services.agent_service import AIAgentService
from database.db_config import get_db_connection

app = FastAPI(
    title="AI Travel Concierge API",
    description="Intelligent travel planning assistant",
    version="1.0.0"
)

# CORS configuration - Allow all frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:5173",  # Vite default port
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Agent
agent_service = None


@app.on_event("startup")
async def startup_event():
    """Initialize AI Agent on startup"""
    global agent_service
    try:
        agent_service = AIAgentService()
        print("✅ AI Agent Service initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize AI Agent: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Travel Concierge API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "concierge": "/api/concierge (POST)",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent_initialized": agent_service is not None,
        "timestamp": datetime.now().isoformat()
    }


def fetch_booking_from_db(booking_id: int):
    """Fetch booking details from MySQL database"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Fetch booking with property details
        query = """
                SELECT b.id, \
                       b.property_id, \
                       b.user_id, \
                       b.check_in, \
                       b.check_out, \
                       b.guests, \
                       b.total_price, \
                       b.status, \
                       p.title as property_title, \
                       p.location, \
                       p.type, \
                       p.amenities
                FROM bookings b
                         INNER JOIN properties p ON b.property_id = p.id
                WHERE b.id = %s \
                """

        cursor.execute(query, (booking_id,))
        booking = cursor.fetchone()

        cursor.close()
        connection.close()

        if not booking:
            return None

        return booking

    except Exception as e:
        print(f"Error fetching booking from database: {e}")
        raise


@app.post("/api/concierge", response_model=AgentResponse)
async def generate_itinerary(request: AgentRequest):
    """
    Generate personalized travel itinerary

    Request body:
    - booking_id: ID of the booking
    - user_id: ID of the user
    - free_text: Optional free-text preferences
    - preferences: Optional structured preferences (budget, interests, etc.)
    """

    if agent_service is None:
        raise HTTPException(status_code=503, detail="AI Agent service not initialized")

    try:
        # Fetch booking details from database
        print(f"📋 Fetching booking {request.booking_id} from database...")
        booking_data = fetch_booking_from_db(request.booking_id)

        if not booking_data:
            raise HTTPException(
                status_code=404,
                detail=f"Booking {request.booking_id} not found"
            )

        # Parse booking data
        check_in = booking_data['check_in']
        check_out = booking_data['check_out']

        # Convert to string format if they're date objects
        if hasattr(check_in, 'strftime'):
            check_in_str = check_in.strftime('%Y-%m-%d')
        else:
            check_in_str = str(check_in)

        if hasattr(check_out, 'strftime'):
            check_out_str = check_out.strftime('%Y-%m-%d')
        else:
            check_out_str = str(check_out)

        # Determine party composition
        total_guests = booking_data['guests']
        # Default: assume all adults unless specified in free_text
        adults = total_guests
        children = 0

        # Try to parse children from free_text
        if request.free_text:
            free_text_lower = request.free_text.lower()
            if 'kid' in free_text_lower or 'child' in free_text_lower:
                # Simple heuristic: if kids mentioned, assume at least 1 child
                children = 1
                adults = max(1, total_guests - children)

        # Create booking context
        booking_context = BookingContext(
            location=booking_data['location'],
            check_in=str(check_in),
            check_out=str(check_out),
            party_type=PartyType(adults=adults, children=children)
        )

        # Use provided preferences or create defaults
        preferences = request.preferences or Preferences(
            budget='medium',
            interests=['culture', 'food', 'nature'],
            dietary_restrictions = [],
            mobility_needs='none'
        )

        # Extract preferences from free_text if provided
        if request.free_text:
            free_text_lower = request.free_text.lower()

            # Detect dietary restrictions
            dietary_keywords = {
                'vegan': 'vegan',
                'vegetarian': 'vegetarian',
                'gluten-free': 'gluten-free',
                'halal': 'halal',
                'kosher': 'kosher',
                'dairy-free': 'dairy-free'
            }
            for keyword, restriction in dietary_keywords.items():
                if keyword in free_text_lower and restriction not in preferences.dietary_restrictions:
                    preferences.dietary_restrictions.append(restriction)

            # Detect interests
            interest_keywords = {
                'culture': ['culture', 'museum', 'art', 'history'],
                'food': ['food', 'restaurant', 'dining', 'cuisine'],
                'nature': ['nature', 'outdoor', 'hiking', 'park', 'beach'],
                'adventure': ['adventure', 'thrill', 'sport'],
                'relaxation': ['relax', 'spa', 'calm', 'peaceful'],
                'nightlife': ['nightlife', 'bar', 'club', 'party'],
                'shopping': ['shopping', 'mall', 'boutique']
            }
            for interest, keywords in interest_keywords.items():
                if any(kw in free_text_lower for kw in keywords) and interest not in preferences.interests:
                    preferences.interests.append(interest)

            # Detect mobility needs
            if 'wheelchair' in free_text_lower or 'accessible' in free_text_lower:
                preferences.mobility_needs = 'wheelchair'
            elif 'limited mobility' in free_text_lower or 'no long walk' in free_text_lower or 'no hike' in free_text_lower:
                preferences.mobility_needs = 'limited'

        print(f"🎯 Generating itinerary for {booking_context.location}")
        print(f"   Dates: {check_in} to {check_out}")
        print(f"   Party: {adults} adults, {children} children")
        print(f"   Interests: {preferences.interests}")
        print(f"   Dietary: {preferences.dietary_restrictions}")

        # Generate itinerary using AI agent
        itinerary = agent_service.generate_itinerary(
            request.data
        )

        print(f"✅ Itinerary generated successfully!")
        print(f"   Days: {len(itinerary.days)}")
        print(f"   Packing items: {len(itinerary.packing_checklist)}")

        return itinerary

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating itinerary: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("🚀 AI Travel Concierge API Starting...")
    print("=" * 60)
    print("📍 Endpoints available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")