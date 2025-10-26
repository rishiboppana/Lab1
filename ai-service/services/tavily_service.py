from tavily import TavilyClient
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from datetime import datetime

load_dotenv()

TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')


class TavilyService:
    def __init__(self):
        if not TAVILY_API_KEY:
            raise ValueError("TAVILY_API_KEY not found in environment variables")
        self.client = TavilyClient(api_key=TAVILY_API_KEY)

    def search_local_events(self, location: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Search for local events in a location during specific dates

        Args:
            location: City/destination name
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            List of event dictionaries with title, content, url
        """
        try:
            # Format dates for better readability
            start = datetime.strptime(start_date, "%Y-%m-%d").strftime("%B %Y")
            end = datetime.strptime(end_date, "%Y-%m-%d").strftime("%B %Y")

            query = f"events and festivals in {location} {start}"
            print(f"Searching events: {query}")

            response = self.client.search(
                query=query,
                max_results=5,
                search_depth="advanced"
            )

            return response.get('results', [])
        except Exception as e:
            print(f"Error searching local events: {e}")
            return []

    def search_points_of_interest(self, location: str, interests: List[str],
                                  has_children: bool = False,
                                  needs_wheelchair: bool = False) -> List[Dict[str, Any]]:
        """
        Search for tourist attractions and activities based on interests

        Args:
            location: City/destination name
            interests: List of interests (adventure, culture, food, etc.)
            has_children: Whether traveling with children
            needs_wheelchair: Whether wheelchair accessibility is needed

        Returns:
            List of POI dictionaries
        """
        try:
            # Build query based on interests
            interest_str = " ".join(interests[:3])  # Limit to top 3 interests

            modifiers = []
            if has_children:
                modifiers.append("family-friendly")
            if needs_wheelchair:
                modifiers.append("wheelchair accessible")

            modifier_str = " ".join(modifiers)

            query = f"top {interest_str} attractions and activities in {location} {modifier_str}"
            print(f"Searching POIs: {query}")

            response = self.client.search(
                query=query,
                max_results=10,
                search_depth="advanced"
            )

            return response.get('results', [])
        except Exception as e:
            print(f"Error searching POIs: {e}")
            return []

    def search_restaurants(self, location: str, dietary_filters: List[str] = None,
                           budget: str = "medium", has_children: bool = False) -> List[Dict[str, Any]]:
        """
        Search for restaurants with dietary options

        Args:
            location: City/destination name
            dietary_filters: List of dietary requirements (vegan, gluten-free, etc.)
            budget: Budget level (low, medium, high)
            has_children: Whether traveling with children

        Returns:
            List of restaurant dictionaries
        """
        try:
            # Build dietary query
            if dietary_filters and len(dietary_filters) > 0:
                dietary_str = " and ".join(dietary_filters)
                query = f"best {dietary_str} restaurants in {location}"
            else:
                query = f"best restaurants in {location}"

            # Add budget modifier
            if budget == "low":
                query += " affordable budget-friendly"
            elif budget == "high":
                query += " fine dining upscale"

            # Add family-friendly if needed
            if has_children:
                query += " family-friendly"

            print(f"Searching restaurants: {query}")

            response = self.client.search(
                query=query,
                max_results=8,
                search_depth="advanced"
            )

            return response.get('results', [])
        except Exception as e:
            print(f"Error searching restaurants: {e}")
            return []

    def get_weather_forecast(self, location: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get weather forecast for destination

        Args:
            location: City/destination name
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            List of weather information dictionaries
        """
        try:
            # Format dates
            start = datetime.strptime(start_date, "%Y-%m-%d").strftime("%B %d, %Y")

            query = f"weather forecast {location} {start}"
            print(f"Searching weather: {query}")

            response = self.client.search(
                query=query,
                max_results=3,
                search_depth="basic"
            )

            return response.get('results', [])
        except Exception as e:
            print(f"Error getting weather: {e}")
            return []

    def search_transportation(self, location: str) -> List[Dict[str, Any]]:
        """
        Search for local transportation options

        Args:
            location: City/destination name

        Returns:
            List of transportation info dictionaries
        """
        try:
            query = f"public transportation and getting around {location}"
            print(f"Searching transportation: {query}")

            response = self.client.search(
                query=query,
                max_results=3,
                search_depth="basic"
            )

            return response.get('results', [])
        except Exception as e:
            print(f"Error searching transportation: {e}")
            return []

    def test_search(self):
        """Test the Tavily search functionality"""
        print("\n=== Testing Tavily Search ===\n")

        # Test 1: Local events
        print("1. Testing local events search...")
        events = self.search_local_events("San Francisco", "2025-11-01", "2025-11-05")
        print(f"Found {len(events)} events")
        if events:
            print(f"Sample: {events[0].get('title', 'N/A')}")

        # Test 2: POIs
        print("\n2. Testing POIs search...")
        pois = self.search_points_of_interest("San Francisco", ["culture", "food"], has_children=True)
        print(f"Found {len(pois)} POIs")
        if pois:
            print(f"Sample: {pois[0].get('title', 'N/A')}")

        # Test 3: Restaurants
        print("\n3. Testing restaurant search...")
        restaurants = self.search_restaurants("San Francisco", ["vegan", "gluten-free"], budget="medium")
        print(f"Found {len(restaurants)} restaurants")
        if restaurants:
            print(f"Sample: {restaurants[0].get('title', 'N/A')}")

        # Test 4: Weather
        print("\n4. Testing weather search...")
        weather = self.get_weather_forecast("San Francisco", "2025-11-01", "2025-11-05")
        print(f"Found {len(weather)} weather results")
        if weather:
            print(f"Sample: {weather[0].get('title', 'N/A')[:100]}...")

        print("\n=== All tests completed ===\n")


if __name__ == "__main__":
    # Test the service
    try:
        tavily_service = TavilyService()
        tavily_service.test_search()
    except ValueError as e:
        print(f"Error: {e}")
        print("Please set TAVILY_API_KEY in your .env file")