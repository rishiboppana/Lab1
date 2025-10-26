from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date


# ============================================
# INPUT MODELS (Request)
# ============================================

class PartyType(BaseModel):
    """Party composition"""
    adults: int = Field(ge=1, description="Number of adults")
    children: int = Field(ge=0, default=0, description="Number of children")
    infants: int = Field(ge=0, default=0, description="Number of infants")


class Preferences(BaseModel):
    """User travel preferences"""
    budget: str = Field(
        default="medium",
        description="Budget level: low, medium, or high"
    )
    interests: List[str] = Field(
        default=[],
        description="List of interests: adventure, culture, relaxation, food, nature, shopping, nightlife"
    )
    mobility_needs: Optional[str] = Field(
        default="none",
        description="Mobility requirements: none, limited, or wheelchair"
    )
    dietary_filters: List[str] = Field(
        default=[],
        description="Dietary restrictions: vegan, vegetarian, gluten-free, halal, kosher, dairy-free"
    )


class BookingContext(BaseModel):
    """Booking information context"""
    booking_id: Optional[int] = Field(
        default=None,
        description="Booking ID from database (if available)"
    )
    location: str = Field(
        description="Destination location/city"
    )
    start_date: str = Field(
        description="Check-in date in YYYY-MM-DD format"
    )
    end_date: str = Field(
        description="Check-out date in YYYY-MM-DD format"
    )
    party_type: PartyType


class AgentRequest(BaseModel):
    """Main request model for AI Concierge"""
    booking_context: BookingContext
    preferences: Preferences
    free_text_query: Optional[str] = Field(
        default=None,
        description="Natural language query from user"
    )


# ============================================
# OUTPUT MODELS (Response)
# ============================================

class ActivityCard(BaseModel):
    """Individual activity/attraction card"""
    title: str = Field(description="Activity name")
    address: str = Field(description="Location address")
    geo: Optional[Dict[str, float]] = Field(
        default=None,
        description="Geographic coordinates {lat, lng}"
    )
    price_tier: str = Field(
        description="Price level: $, $$, or $$$"
    )
    duration: str = Field(
        description="Estimated duration (e.g., '2 hours', 'half-day')"
    )
    tags: List[str] = Field(
        default=[],
        description="Activity tags/categories"
    )
    wheelchair_friendly: bool = Field(
        default=False,
        description="Wheelchair accessible"
    )
    child_friendly: bool = Field(
        default=False,
        description="Suitable for children"
    )
    description: str = Field(
        description="Activity description"
    )
    source_url: Optional[str] = Field(
        default=None,
        description="Source URL for more info"
    )


class RestaurantRec(BaseModel):
    """Restaurant recommendation"""
    name: str = Field(description="Restaurant name")
    cuisine: str = Field(description="Cuisine type")
    address: str = Field(description="Restaurant address")
    price_tier: str = Field(
        description="Price level: $, $$, or $$$"
    )
    dietary_options: List[str] = Field(
        default=[],
        description="Available dietary options"
    )
    rating: Optional[float] = Field(
        default=None,
        ge=0,
        le=5,
        description="Rating out of 5"
    )
    child_friendly: bool = Field(
        default=False,
        description="Kid-friendly restaurant"
    )
    wheelchair_accessible: bool = Field(
        default=False,
        description="Wheelchair accessible"
    )
    description: Optional[str] = Field(
        default=None,
        description="Restaurant description"
    )
    source_url: Optional[str] = Field(
        default=None,
        description="Source URL"
    )


class DayPlan(BaseModel):
    """Daily itinerary plan"""
    day_number: int = Field(ge=1, description="Day number in trip")
    date: str = Field(description="Date in YYYY-MM-DD format")
    morning: List[ActivityCard] = Field(
        default=[],
        description="Morning activities (9 AM - 12 PM)"
    )
    afternoon: List[ActivityCard] = Field(
        default=[],
        description="Afternoon activities (12 PM - 5 PM)"
    )
    evening: List[ActivityCard] = Field(
        default=[],
        description="Evening activities (5 PM - 9 PM)"
    )
    restaurants: List[RestaurantRec] = Field(
        default=[],
        description="Restaurant recommendations for the day"
    )
    daily_summary: Optional[str] = Field(
        default=None,
        description="Summary of the day's theme/focus"
    )


class AgentResponse(BaseModel):
    """Complete AI Concierge response"""
    itinerary: List[DayPlan] = Field(
        description="Day-by-day travel plan"
    )
    packing_checklist: List[str] = Field(
        description="Items to pack for the trip"
    )
    weather_summary: str = Field(
        description="Weather forecast summary"
    )
    local_tips: List[str] = Field(
        default=[],
        description="Local tips and insider information"
    )
    total_estimated_cost: Optional[str] = Field(
        default=None,
        description="Estimated total trip cost"
    )


# ============================================
# SIMPLIFIED MODELS (for quick responses)
# ============================================

class QuickSuggestion(BaseModel):
    """Quick suggestion response"""
    message: str
    suggestions: List[str]


class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    service: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    status_code: int