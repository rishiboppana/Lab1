"""
AI Agent Service - Travel Itinerary Generation
Uses LangChain + Ollama + Tavily
"""
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
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

        print(f"✅ AI Agent initialized with model: {ollama_model}")

    def generate_itinerary(self, booking_context: BookingContext,
                          preferences: Preferences,
                          free_text: Optional[str] = None) -> AgentResponse:
        """
        Main method to generate complete travel itinerary

        Args:
            booking_context: BookingContext object with location, dates, party info
            preferences: Preferences object with budget, interests, dietary needs
            free_text: Optional free-text user input
        """

        print(f"\n{'='*60}")
        print(f"Generating itinerary for {booking_context.location}")
        print(f"Dates: {booking_context.check_in} to {booking_context.check_out}")
        print(f"Party: {booking_context.party_type.adults} adults, {booking_context.party_type.children} children")
        print(f"Interests: {', '.join(preferences.interests)}")
        print(f"{'='*60}\n")

        # Step 1: Calculate trip duration
        start_date = datetime.strptime(booking_context.check_in, "%Y-%m-%d")
        end_date = datetime.strptime(booking_context.check_out, "%Y-%m-%d")
        num_days = (end_date - start_date).days

        print(f"📅 Trip duration: {num_days} days")

        # Step 2: Gather contextual information using Tavily
        print("\n📡 Gathering local information...")
        context_data = self._gather_context(booking_context, preferences, num_days)

        # Step 3: Generate day-by-day itinerary
        print("\n🧠 Generating day-by-day itinerary...")
        itinerary = self._generate_daily_plans(
            booking_context, preferences, num_days, start_date, context_data
        )

        # Step 4: Generate packing checklist
        print("\n🎒 Creating packing checklist...")
        packing_list = self._generate_packing_list(
            booking_context, preferences, context_data.get('weather', [])
        )

        # Step 5: Extract weather summary
        weather_summary = self._extract_weather_summary(context_data.get('weather', []))

        # Step 6: Generate local tips
        local_tips = self._generate_local_tips(booking_context.location, context_data)

        # Step 7: Generate dynamic cost estimate based on actual itinerary
        print("\n💰 Calculating cost estimate...")
        cost_estimate = self._estimate_cost(
            num_days=num_days,
            budget=preferences.budget,
            location=booking_context.location,
            itinerary=itinerary
        )

        print("\n✅ Itinerary generation complete!\n")

        return AgentResponse(
            itinerary=itinerary,
            packing_checklist=packing_list,
            weather_summary=weather_summary,
            local_tips=local_tips,
            total_estimated_cost=cost_estimate
        )

    def _gather_context(self, booking: BookingContext, prefs: Preferences, num_days: int) -> Dict[str, Any]:
        """
        Gather all contextual information using Tavily
        """
        has_children = booking.party_type.children > 0
        needs_wheelchair = prefs.mobility_needs == "wheelchair"

        context = {
            'events': self.tavily.search_local_events(
                booking.location, booking.check_in, booking.check_out
            ),
            'pois': self.tavily.search_points_of_interest(
                booking.location, prefs.interests, has_children, needs_wheelchair
            ),
            'restaurants': self.tavily.search_restaurants(
                booking.location, prefs.dietary_restrictions, prefs.budget, has_children
            ),
            'weather': self.tavily.get_weather_forecast(
                booking.location, booking.check_in, booking.check_out
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

            print(f"  📝 Planning Day {day_num + 1} ({current_date.strftime('%Y-%m-%d')})...")

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
        if booking.party_type.infants > 0:
            party_str += f", {booking.party_type.infants} infants"

        dietary_str = ", ".join(prefs.dietary_restrictions) if prefs.dietary_restrictions else "None"

        # Call LLM
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

        # Helper function to safely parse activity
        def parse_activity(act, default_title, default_duration, default_tags):
            if isinstance(act, str):
                # If it's just a string, create a simple activity
                return {
                    'title': act,
                    'description': f"Enjoy {act.lower()}",
                    'duration': default_duration,
                    'location': booking.location
                }
            elif isinstance(act, dict):
                return act
            else:
                return {
                    'title': default_title,
                    'description': f"Explore local {default_title.lower()}",
                    'duration': default_duration,
                    'location': booking.location
                }

        # Parse morning activities
        morning_data = data.get('morning', [])
        morning_activities = []
        for act in morning_data:
            parsed = parse_activity(act, 'Morning Activity', '2 hours', prefs.interests[:2] if prefs.interests else ['sightseeing'])
            morning_activities.append(
                ActivityCard(
                    title=parsed.get('title', 'Morning Activity'),
                    address=parsed.get('location', booking.location),
                    price_tier=price_tier,
                    duration=parsed.get('duration', '2 hours'),
                    tags=prefs.interests[:2] if prefs.interests else ['sightseeing'],
                    wheelchair_friendly=needs_wheelchair,
                    child_friendly=has_children,
                    description=parsed.get('description', 'Explore local attractions')
                )
            )

        # Parse afternoon activities
        afternoon_data = data.get('afternoon', [])
        afternoon_activities = []
        for act in afternoon_data:
            parsed = parse_activity(act, 'Afternoon Activity', '3 hours', prefs.interests if prefs.interests else ['culture'])
            afternoon_activities.append(
                ActivityCard(
                    title=parsed.get('title', 'Afternoon Activity'),
                    address=parsed.get('location', booking.location),
                    price_tier=price_tier,
                    duration=parsed.get('duration', '3 hours'),
                    tags=prefs.interests if prefs.interests else ['culture'],
                    wheelchair_friendly=needs_wheelchair,
                    child_friendly=has_children,
                    description=parsed.get('description', 'Main activity of the day')
                )
            )

        # Parse evening activities
        evening_data = data.get('evening', [])
        evening_activities = []
        for act in evening_data:
            parsed = parse_activity(act, 'Evening Activity', '2 hours', ['dining', 'culture'])
            evening_activities.append(
                ActivityCard(
                    title=parsed.get('title', 'Evening Activity'),
                    address=parsed.get('location', booking.location),
                    price_tier=price_tier,
                    duration=parsed.get('duration', '2 hours'),
                    tags=['dining', 'culture'],
                    wheelchair_friendly=needs_wheelchair,
                    child_friendly=has_children,
                    description=parsed.get('description', 'Evening entertainment')
                )
            )

        # Parse restaurants
        restaurant_data = data.get('restaurants', [])
        restaurants = []
        for rest in restaurant_data:
            if isinstance(rest, str):
                # If it's just a string, create a simple restaurant
                parsed = {
                    'name': rest,
                    'cuisine': 'Local cuisine',
                    'location': booking.location,
                    'why': 'Recommended dining option'
                }
            elif isinstance(rest, dict):
                parsed = rest
            else:
                parsed = {
                    'name': 'Local Restaurant',
                    'cuisine': 'Local cuisine',
                    'location': booking.location,
                    'why': 'Recommended dining option'
                }

            restaurants.append(
                RestaurantRec(
                    name=parsed.get('name', 'Local Restaurant'),
                    cuisine=parsed.get('cuisine', 'Local cuisine'),
                    address=parsed.get('location', booking.location),
                    price_tier=price_tier,
                    dietary_options=prefs.dietary_restrictions,
                    child_friendly=has_children,
                    wheelchair_accessible=needs_wheelchair,
                    description=parsed.get('why', 'Great local dining option')
                )
            )

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
- Duration: {booking.check_in} to {booking.check_out}
- Party: {booking.party_type.adults} adults, {booking.party_type.children} children
- Interests: {', '.join(prefs.interests)}
- Mobility needs: {prefs.mobility_needs}
- Weather: {weather_summary}

Provide 10-15 essential items to pack. Be specific and practical.
Return as a simple list, one item per line, no numbering."""

        response = self.llm.invoke(prompt)

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

        summary = self.llm.invoke(prompt)
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

        response = self.llm.invoke(prompt)

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

    def _estimate_cost(self, num_days: int, budget: str,
                      location: str, itinerary: List[DayPlan]) -> str:
        """
        Generate dynamic cost estimate using LLM based on actual activities
        """
        # Analyze the actual itinerary
        activity_details = []
        restaurant_details = []

        for day_idx, day in enumerate(itinerary, 1):
            day_activities = day.morning + day.afternoon + day.evening
            for activity in day_activities:
                activity_details.append({
                    'day': day_idx,
                    'title': activity.title,
                    'tier': activity.price_tier,
                    'duration': activity.duration
                })

            for restaurant in day.restaurants:
                restaurant_details.append({
                    'day': day_idx,
                    'name': restaurant.name,
                    'cuisine': restaurant.cuisine,
                    'tier': restaurant.price_tier
                })

        # Count by price tier
        activity_count = {'$': 0, '$$': 0, '$$$': 0}
        for act in activity_details:
            tier = act['tier']
            if tier in activity_count:
                activity_count[tier] += 1
            else:
                activity_count['$$'] += 1  # Default to medium

        restaurant_count = {'$': 0, '$$': 0, '$$$': 0}
        for rest in restaurant_details:
            tier = rest['tier']
            if tier in restaurant_count:
                restaurant_count[tier] += 1
            else:
                restaurant_count['$$'] += 1  # Default to medium

        # Build detailed activity list for LLM
        activities_summary = f"""Activities breakdown ({len(activity_details)} total):
- Budget ($): {activity_count['$']} activities
- Mid-range ($$): {activity_count['$$']} activities
- Premium ($$$): {activity_count['$$$']} activities

Sample activities:
{chr(10).join([f"  • Day {a['day']}: {a['title']} ({a['tier']}, {a['duration']})" for a in activity_details[:5]])}

Dining ({len(restaurant_details)} meals):
- Budget ($): {restaurant_count['$']} meals
- Mid-range ($$): {restaurant_count['$$']} meals
- Premium ($$$): {restaurant_count['$$$']} meals

Sample restaurants:
{chr(10).join([f"  • Day {r['day']}: {r['name']} - {r['cuisine']} ({r['tier']})" for r in restaurant_details[:5]])}"""

        # Create prompt for LLM
        prompt = f"""You are a travel cost estimation expert. Calculate realistic trip costs for {location}.

Trip Details:
- Location: {location}
- Duration: {num_days} days
- Budget preference: {budget}

{activities_summary}

Calculate costs considering:
1. Activity entrance fees/tickets based on price tiers:
   - $ tier: $5-15 per activity
   - $$ tier: $15-40 per activity
   - $$$ tier: $40-100+ per activity

2. Restaurant meals based on tiers:
   - $ tier: $10-20 per meal
   - $$ tier: $20-45 per meal
   - $$$ tier: $45-100+ per meal

3. Daily local transportation: $10-30/day depending on location

4. Location multiplier for {location}:
   - Major cities (NYC, SF, London): 1.3x
   - Tourist destinations: 1.2x
   - Average cities: 1.0x
   - Small towns: 0.8x

5. Miscellaneous (tips, snacks, souvenirs): 15-20% extra

Provide ONE realistic cost range in this EXACT format:
$XXX-$YYY per person

IMPORTANT: Return ONLY the cost range in format "$XXX-$YYY per person", nothing else."""

        try:
            response = self.llm.invoke(prompt)
            response = response.strip()

            # Extract cost range using regex
            import re
            # Match patterns like $250-$400 or $1,200-$1,500
            match = re.search(r'\$[\d,]+\s*-\s*\$[\d,]+', response)
            if match:
                cost_range = match.group(0).replace(' ', '')
                return f"{cost_range} per person (excluding accommodation)"

            # Try to find just the first line
            first_line = response.split('\n')[0].strip()
            if '$' in first_line:
                return f"{first_line} (excluding accommodation)" if 'excluding' not in first_line.lower() else first_line

            # Final fallback
            print(f"⚠ LLM response did not match pattern: {response[:100]}")
            return self._fallback_cost_estimate(num_days, budget, activity_details, restaurant_details)

        except Exception as e:
            print(f"⚠ Cost estimation error: {e}")
            return self._fallback_cost_estimate(num_days, budget, activity_details, restaurant_details)

    def _fallback_cost_estimate(self, num_days: int, budget: str,
                                activity_details: list = None,
                                restaurant_details: list = None) -> str:
        """Enhanced fallback cost estimation based on actual activities"""

        if activity_details and restaurant_details:
            # Calculate based on actual activities
            activity_cost = 0
            tier_costs = {'$': 10, '$$': 25, '$$$': 60}

            for act in activity_details:
                tier = act.get('tier', '$$')
                activity_cost += tier_costs.get(tier, tier_costs['$$'])

            restaurant_cost = 0
            meal_costs = {'$': 15, '$$': 30, '$$$': 70}

            for rest in restaurant_details:
                tier = rest.get('tier', '$$')
                restaurant_cost += meal_costs.get(tier, meal_costs['$$'])

            transport_cost = num_days * 20  # $20/day for local transport
            misc_cost = (activity_cost + restaurant_cost + transport_cost) * 0.15  # 15% buffer

            total = activity_cost + restaurant_cost + transport_cost + misc_cost
            min_estimate = int(total * 0.85)  # -15%
            max_estimate = int(total * 1.15)  # +15%

            return f"${min_estimate}-${max_estimate} per person (excluding accommodation)"

        # Basic fallback if no activity data
        daily_costs = {
            "low": (50, 90),
            "medium": (90, 160),
            "high": (160, 280)
        }

        min_cost, max_cost = daily_costs.get(budget, (90, 160))
        total_min = min_cost * num_days
        total_max = max_cost * num_days

        return f"${total_min}-${total_max} per person (excluding accommodation)"