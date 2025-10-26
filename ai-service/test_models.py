from models.schemas import (
    AgentRequest, BookingContext, PartyType, Preferences,
    ActivityCard, RestaurantRec, DayPlan, AgentResponse
)


def test_models():
    print("Testing Pydantic Models...\n")

    # Test 1: Create a booking context
    print("1. Testing BookingContext...")
    party = PartyType(adults=2, children=1, infants=0)
    booking = BookingContext(
        booking_id=1,
        location="San Francisco, CA",
        start_date="2025-11-01",
        end_date="2025-11-05",
        party_type=party
    )
    print(f"✓ BookingContext created: {booking.location}, {party.adults} adults, {party.children} children")

    # Test 2: Create preferences
    print("\n2. Testing Preferences...")
    prefs = Preferences(
        budget="medium",
        interests=["culture", "food", "nature"],
        mobility_needs="none",
        dietary_filters=["vegan"]
    )
    print(f"✓ Preferences created: budget={prefs.budget}, interests={prefs.interests}")

    # Test 3: Create full request
    print("\n3. Testing AgentRequest...")
    request = AgentRequest(
        booking_context=booking,
        preferences=prefs,
        free_text_query="We want family-friendly activities"
    )
    print(f"✓ AgentRequest created with free text: '{request.free_text_query}'")

    # Test 4: Create activity card
    print("\n4. Testing ActivityCard...")
    activity = ActivityCard(
        title="Golden Gate Bridge Walk",
        address="Golden Gate Bridge, San Francisco, CA",
        price_tier="$",
        duration="2 hours",
        tags=["nature", "sightseeing", "photography"],
        wheelchair_friendly=True,
        child_friendly=True,
        description="Walk across the iconic Golden Gate Bridge with stunning views"
    )
    print(f"✓ ActivityCard created: {activity.title}")

    # Test 5: Create restaurant recommendation
    print("\n5. Testing RestaurantRec...")
    restaurant = RestaurantRec(
        name="Greens Restaurant",
        cuisine="Vegetarian",
        address="Fort Mason, San Francisco, CA",
        price_tier="$$",
        dietary_options=["vegan", "vegetarian", "gluten-free"],
        rating=4.5,
        child_friendly=True,
        wheelchair_accessible=True
    )
    print(f"✓ RestaurantRec created: {restaurant.name}, Rating: {restaurant.rating}")

    # Test 6: Create day plan
    print("\n6. Testing DayPlan...")
    day = DayPlan(
        day_number=1,
        date="2025-11-01",
        morning=[activity],
        afternoon=[],
        evening=[],
        restaurants=[restaurant],
        daily_summary="Explore iconic landmarks and enjoy waterfront dining"
    )
    print(f"✓ DayPlan created: Day {day.day_number}, {len(day.morning)} morning activities")

    # Test 7: Create full response
    print("\n7. Testing AgentResponse...")
    response = AgentResponse(
        itinerary=[day],
        packing_checklist=["Comfortable walking shoes", "Light jacket", "Camera"],
        weather_summary="Mild temperatures, occasional fog in the morning",
        local_tips=["Arrive at Golden Gate Bridge early to avoid crowds"],
        total_estimated_cost="$500-$700 for 4 days"
    )
    print(f"✓ AgentResponse created: {len(response.itinerary)} days, {len(response.packing_checklist)} packing items")

    # Test 8: Convert to JSON
    print("\n8. Testing JSON serialization...")
    json_data = response.model_dump_json(indent=2)
    print(f"✓ Successfully converted to JSON ({len(json_data)} characters)")

    print("\n✅ All model tests passed!\n")
    return True


if __name__ == "__main__":
    test_models()