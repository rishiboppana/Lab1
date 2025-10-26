"""
AI Agent Service - Travel Itinerary Generation
Uses LangChain + Ollama + Tavily
"""
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json
import os
from dotenv import load_dotenv

import sys
import os
# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import (
    AgentRequest, AgentResponse, DayPlan, ActivityCard,
    RestaurantRec, Preferences, BookingContext
)
from services.tavily_service import TavilyService

load_dotenv()

class AIAgentService:
    def __init__(self):
        # Initialize Ollama LLM
        ollama_model = os.getenv('OLLAMA_MODEL', 'llama3.2:latest')
        self.llm = Ollama(
            model=ollama_model,
            temperature=0.7,
            base_url=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        )

        # Initialize Tavily service
        self.tavily = TavilyService()

        print(f"AI Agent initialized with model: {ollama_model}")

    def generate_itinerary(self, request: AgentRequest) -> AgentResponse:
        """
        Main method to generate complete travel itinerary
        """
        booking = request.booking_context
        prefs = request.preferences

        print(f"\n{'='*60}")
        print(f"Generating itinerary for {booking.location}")
        print(f"Dates: {booking.start_date} to {booking.end_date}")
        print(f"Party: {booking.party_type.adults} adults, {booking.party_type.children} children")
        print(f"Interests: {', '.join(prefs.interests)}")
        print(f"{'='*60}\n")

        # Step 1: Calculate trip duration
        start_date = datetime.strptime(booking.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(booking.end_date, "%Y-%m-%d")
        num_days = (end_date - start_date).days

        print(f"Trip duration: {num_days} days")

        # Step 2: Gather contextual information using Tavily
        print("\n📡 Gathering local information...")
        context_data = self._gather_context(booking, prefs, num_days)

        # Step 3: Generate day-by-day itinerary
        print("\n🧠 Generating day-by-day itinerary...")
        itinerary = self._generate_daily_plans(
            booking, prefs, num_days, start_date, context_data
        )

        # Step 4: Generate packing checklist
        print("\n🎒 Creating packing checklist...")
        packing_list = self._generate_packing_list(
            booking, prefs, context_data.get('weather', [])
        )

        # Step 5: Extract weather summary
        weather_summary = self._extract_weather_summary(context_data.get('weather', []))

        # Step 6: Generate local tips
        local_tips = self._generate_local_tips(booking.location, context_data)

        print("\n✅ Itinerary generation complete!\n")

        return AgentResponse(
            itinerary=itinerary,
            packing_checklist=packing_list,
            weather_summary=weather_summary,
            local_tips=local_tips,
            total_estimated_cost=self._estimate_cost(num_days, prefs.budget)
        )

    def _gather_context(self, booking: BookingContext, prefs: Preferences, num_days: int) -> Dict[str, Any]:
        """
        Gather all contextual information using Tavily
        """
        has_children = booking.party_type.children > 0
        needs_wheelchair = prefs.mobility_needs == "wheelchair"

        context = {
            'events': self.tavily.search_local_events(
                booking.location, booking.start_date, booking.end_date
            ),
            'pois': self.tavily.search_points_of_interest(
                booking.location, prefs.interests, has_children, needs_wheelchair
            ),
            'restaurants': self.tavily.search_restaurants(
                booking.location, prefs.dietary_filters, prefs.budget, has_children
            ),
            'weather': self.tavily.get_weather_forecast(
                booking.location, booking.start_date, booking.end_date
            ),
            'transportation': self.tavily.search_transportation(booking.location)
        }

        print(f"  ✓ Found {len(context['events'])} local events")
        print(f"  ✓ Found {len(context['pois'])} points of interest")
        print(f"  ✓ Found {len(context['restaurants'])} restaurants")
        print(f"  ✓ Found {len(context['weather'])} weather sources")

        return context

    def _generate_daily_plans(self, booking: BookingContext, prefs: Preferences,
                             num_days: int, start_date: datetime,
                             context_data: Dict[str, Any]) -> List[DayPlan]:
        """
        Generate detailed day-by-day plans using LLM
        """
        itinerary = []

        for day_num in range(num_days):
            current_date = start_date + timedelta(days=day_num)

            print(f"  Planning Day {day_num + 1} ({current_date.strftime('%Y-%m-%d')})...")

            # Generate activities for this day
            day_plan = self._generate_single_day(
                day_num + 1,
                current_date,
                booking,
                prefs,
                context_data
            )

            itinerary.append(day_plan)

        return itinerary

    def _generate_single_day(self, day_number: int, date: datetime,
                            booking: BookingContext, prefs: Preferences,
                            context_data: Dict[str, Any]) -> DayPlan:
        """
        Generate plan for a single day using LLM
        """
        # Prepare context for LLM
        pois_summary = "\n".join([
            f"- {poi.get('title', 'N/A')}: {poi.get('content', '')[:200]}"
            for poi in context_data['pois'][:8]
        ])

        restaurants_summary = "\n".join([
            f"- {rest.get('title', 'N/A')}: {rest.get('content', '')[:150]}"
            for rest in context_data['restaurants'][:5]
        ])

        events_summary = "\n".join([
            f"- {event.get('title', 'N/A')}: {event.get('content', '')[:150]}"
            for event in context_data['events'][:3]
        ])

        # Create prompt for day planning
        prompt = PromptTemplate(
            input_variables=["day_number", "location", "interests", "budget", "party",
                           "dietary", "mobility", "pois", "restaurants", "events", "date"],
            template="""You are an expert travel planner. Create a detailed day plan for travelers.

Day {day_number} - {date}
Location: {location}
Party: {party}
Interests: {interests}
Budget: {budget}
Dietary restrictions: {dietary}
Mobility needs: {mobility}

Available attractions and activities:
{pois}

Available restaurants:
{restaurants}

Local events:
{events}

Create a realistic day plan with:
1. MORNING (9 AM - 12 PM): 1-2 activities
2. AFTERNOON (12 PM - 5 PM): 1-2 activities  
3. EVENING (5 PM - 9 PM): 1 activity
4. DINING: 2-3 restaurant recommendations

For each activity, provide:
- Title
- Brief description (1-2 sentences)
- Duration
- Location/address
- Why it's suitable for this group

Consider:
- Children need shorter activities and frequent breaks
- Budget constraints ({budget})
- Dietary restrictions ({dietary})
- Mobility needs ({mobility})
- Mix of activity types
- Logical geographic flow

Format your response as JSON with this structure:
{{
  "morning": [{{"title": "...", "description": "...", "duration": "...", "location": "..."}}],
  "afternoon": [{{"title": "...", "description": "...", "duration": "...", "location": "..."}}],
  "evening": [{{"title": "...", "description": "...", "duration": "...", "location": "..."}}],
  "restaurants": [{{"name": "...", "cuisine": "...", "why": "...", "location": "..."}}],
  "summary": "Brief summary of the day's theme"
}}

Only return valid JSON, no other text."""
        )

        # Prepare variables
        party_str = f"{booking.party_type.adults} adults"
        if booking.party_type.children > 0:
            party_str += f", {booking.party_type.children} children"

        dietary_str = ", ".join(prefs.dietary_filters) if prefs.dietary_filters else "None"

        # Call LLM with updated method
        formatted_prompt = prompt.format(
            day_number=day_number,
            date=date.strftime("%A, %B %d, %Y"),
            location=booking.location,
            interests=", ".join(prefs.interests),
            budget=prefs.budget,
            party=party_str,
            dietary=dietary_str,
            mobility=prefs.mobility_needs,
            pois=pois_summary,
            restaurants=restaurants_summary,
            events=events_summary
        )

        response = self.llm.invoke(formatted_prompt)

        # Parse LLM response
        day_plan = self._parse_day_plan(day_number, date, response, prefs, booking)

        return day_plan

    def _parse_day_plan(self, day_number: int, date: datetime,
                       llm_response: str, prefs: Preferences,
                       booking: BookingContext) -> DayPlan:
        """
        Parse LLM response into structured DayPlan
        """
        try:
            # Clean response - remove markdown code blocks if present
            response_clean = llm_response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:]
            if response_clean.startswith('```'):
                response_clean = response_clean[3:]
            if response_clean.endswith('```'):
                response_clean = response_clean[:-3]

            # Try to extract JSON from response
            json_start = response_clean.find('{')
            json_end = response_clean.rfind('}') + 1

            if json_start != -1 and json_end > json_start:
                json_str = response_clean[json_start:json_end]
                data = json.loads(json_str)
                print(f"    ✓ Successfully parsed day plan JSON")
            else:
                # Fallback to default structure
                print(f"    ⚠ No JSON found, creating default activities")
                data = self._create_default_day_data(day_number, booking, prefs)
        except json.JSONDecodeError as e:
            print(f"    ⚠ JSON decode error: {e}, using smart fallback")
            data = self._create_default_day_data(day_number, booking, prefs)

        # Convert to ActivityCard and RestaurantRec objects
        price_tier_map = {"low": "$", "medium": "$$", "high": "$$$"}
        price_tier = price_tier_map.get(prefs.budget, "$$")

        has_children = booking.party_type.children > 0
        needs_wheelchair = prefs.mobility_needs == "wheelchair"

        morning_activities = [
            ActivityCard(
                title=act.get('title', 'Morning Activity'),
                address=act.get('location', booking.location),
                price_tier=price_tier,
                duration=act.get('duration', '2 hours'),
                tags=prefs.interests[:2],
                wheelchair_friendly=needs_wheelchair,
                child_friendly=has_children,
                description=act.get('description', 'Explore local attractions')
            )
            for act in data.get('morning', [])
        ]

        afternoon_activities = [
            ActivityCard(
                title=act.get('title', 'Afternoon Activity'),
                address=act.get('location', booking.location),
                price_tier=price_tier,
                duration=act.get('duration', '3 hours'),
                tags=prefs.interests,
                wheelchair_friendly=needs_wheelchair,
                child_friendly=has_children,
                description=act.get('description', 'Main activity of the day')
            )
            for act in data.get('afternoon', [])
        ]

        evening_activities = [
            ActivityCard(
                title=act.get('title', 'Evening Activity'),
                address=act.get('location', booking.location),
                price_tier=price_tier,
                duration=act.get('duration', '2 hours'),
                tags=['dining', 'culture'],
                wheelchair_friendly=needs_wheelchair,
                child_friendly=has_children,
                description=act.get('description', 'Evening entertainment')
            )
            for act in data.get('evening', [])
        ]

        restaurants = [
            RestaurantRec(
                name=rest.get('name', 'Local Restaurant'),
                cuisine=rest.get('cuisine', 'Local cuisine'),
                address=rest.get('location', booking.location),
                price_tier=price_tier,
                dietary_options=prefs.dietary_filters,
                child_friendly=has_children,
                wheelchair_accessible=needs_wheelchair,
                description=rest.get('why', 'Great local dining option')
            )
            for rest in data.get('restaurants', [])
        ]

        return DayPlan(
            day_number=day_number,
            date=date.strftime("%Y-%m-%d"),
            morning=morning_activities,
            afternoon=afternoon_activities,
            evening=evening_activities,
            restaurants=restaurants,
            daily_summary=data.get('summary', f'Day {day_number} exploration')
        )

    def _generate_packing_list(self, booking: BookingContext,
                              prefs: Preferences, weather_data: List[Dict]) -> List[str]:
        """
        Generate weather-aware packing checklist using LLM
        """
        weather_summary = " ".join([
            w.get('content', '')[:200] for w in weather_data[:2]
        ])

        prompt = f"""Create a packing checklist for a trip to {booking.location}.

Trip details:
- Duration: {booking.start_date} to {booking.end_date}
- Party: {booking.party_type.adults} adults, {booking.party_type.children} children
- Interests: {', '.join(prefs.interests)}
- Mobility needs: {prefs.mobility_needs}
- Weather: {weather_summary}

Provide 10-15 essential items to pack. Be specific and practical.
Return as a simple list, one item per line, no numbering."""

        response = self.llm(prompt)

        # Parse response into list
        items = [
            line.strip().lstrip('-•*').strip()
            for line in response.split('\n')
            if line.strip() and len(line.strip()) > 3
        ]

        return items[:15]  # Limit to 15 items

    def _extract_weather_summary(self, weather_data: List[Dict]) -> str:
        """
        Extract weather summary from Tavily results
        """
        if not weather_data:
            return "Weather information not available. Check local forecast before departure."

        # Use first weather result
        weather_content = weather_data[0].get('content', '')

        # Use LLM to summarize
        prompt = f"""Summarize this weather information in 1-2 sentences:

{weather_content[:500]}

Be concise and mention key information like temperature range and conditions."""

        summary = self.llm(prompt)
        return summary.strip()

    def _generate_local_tips(self, location: str, context_data: Dict) -> List[str]:
        """
        Generate local tips and insider information
        """
        transport_info = " ".join([
            t.get('content', '')[:200] for t in context_data.get('transportation', [])[:2]
        ])

        prompt = f"""Provide 5 practical local tips for travelers visiting {location}.

Context: {transport_info}

Tips should cover:
- Best times to visit attractions
- Local transportation advice
- Money-saving tips
- Cultural etiquette
- Safety considerations

Return as a list, one tip per line, no numbering."""

        response = self.llm(prompt)

        tips = [
            line.strip().lstrip('-•*').strip()
            for line in response.split('\n')
            if line.strip() and len(line.strip()) > 10
        ]

        return tips[:5]  # Limit to 5 tips

    def _create_default_day_data(self, day_number: int, booking: BookingContext,
                                 prefs: Preferences) -> Dict[str, Any]:
        """Create default day data when LLM fails to return proper JSON"""
        location = booking.location
        interests_str = ", ".join(prefs.interests) if prefs.interests else "sightseeing"

        return {
            "morning": [{
                "title": f"Morning Exploration in {location}",
                "description": f"Start your day exploring {interests_str} attractions",
                "duration": "2-3 hours",
                "location": location
            }],
            "afternoon": [{
                "title": f"Afternoon {prefs.interests[0].title()} Activity" if prefs.interests else "Afternoon Activity",
                "description": f"Continue your adventure with {interests_str} experiences",
                "duration": "3-4 hours",
                "location": location
            }],
            "evening": [{
                "title": "Evening Dining & Leisure",
                "description": "Enjoy local cuisine and evening atmosphere",
                "duration": "2 hours",
                "location": location
            }],
            "restaurants": [{
                "name": f"Local Restaurant in {location}",
                "cuisine": "Local cuisine",
                "why": "Authentic local dining experience",
                "location": location
            }],
            "summary": f"Day {day_number}: Exploring {interests_str} in {location}"
        }

    def _estimate_cost(self, num_days: int, budget: str) -> str:
        """
        Estimate total trip cost based on budget level
        """
        daily_costs = {
            "low": (50, 100),
            "medium": (100, 200),
            "high": (200, 400)
        }

        min_cost, max_cost = daily_costs.get(budget, (100, 200))
        total_min = min_cost * num_days
        total_max = max_cost * num_days

        return f"${total_min}-${total_max} (excluding accommodation)"


# Test function
def test_agent():
    """Test the AI Agent Service"""
    print("\n" + "="*60)
    print("TESTING AI AGENT SERVICE")
    print("="*60)

    # Create test request (models already imported at top)
    party = PartyType(adults=2, children=1)
    booking = BookingContext(
        location="San Francisco, California",
        start_date="2025-11-15",
        end_date="2025-11-17",
        party_type=party
    )
    prefs = Preferences(
        budget="medium",
        interests=["culture", "food", "nature"],
        mobility_needs="none",
        dietary_filters=["vegetarian"]
    )
    request = AgentRequest(
        booking_context=booking,
        preferences=prefs,
        free_text_query="We want family-friendly activities with good food options"
    )

    # Generate itinerary
    agent = AIAgentService()
    response = agent.generate_itinerary(request)

    print("\n" + "="*60)
    print("ITINERARY GENERATED")
    print("="*60)
    print(f"\nDays planned: {len(response.itinerary)}")
    print(f"Packing items: {len(response.packing_checklist)}")
    print(f"Local tips: {len(response.local_tips)}")
    print(f"Estimated cost: {response.total_estimated_cost}")
    print(f"\nWeather: {response.weather_summary}")

    print("\n" + "="*60)
    print("SAMPLE DAY PLAN (Day 1)")
    print("="*60)
    day1 = response.itinerary[0]
    print(f"\nDate: {day1.date}")
    print(f"Summary: {day1.daily_summary}")
    print(f"\nMorning activities: {len(day1.morning)}")
    for act in day1.morning:
        print(f"  - {act.title}: {act.description[:100]}")
    print(f"\nRestaurants: {len(day1.restaurants)}")
    for rest in day1.restaurants:
        print(f"  - {rest.name} ({rest.cuisine})")

    print("\n✅ Test completed successfully!\n")


if __name__ == "__main__":
    test_agent()