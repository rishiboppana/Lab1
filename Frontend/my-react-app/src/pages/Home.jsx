import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const [city, setCity] = useState("your area");
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState("lg");
  const [errorMessage, setErrorMessage] = useState("");

  const scrollRefs = useRef({});

  // Detect screen size for proper card display and scroll amount
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("sm");
      else if (width < 1024) setScreenSize("md");
      else setScreenSize("lg");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (location, direction) => {
    const container = scrollRefs.current[location];
    if (!container) return;

    let scrollAmount = 350;
    if (screenSize === "sm") scrollAmount = 280;
    else if (screenSize === "md") scrollAmount = 320;
    else scrollAmount = 380;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const groupPropertiesByLocation = (properties) => {
    const grouped = {};
    properties.forEach((property) => {
      const loc = property.location || "Other";
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(property);
    });
    return grouped;
  };

  async function getUserCity() {
    try {
      const res = await fetch("http://localhost:4000/api/location");
      const data = await res.json();
      return data.city || "your area";
    } catch {
      return "your area";
    }
  }

  // ✅ UPDATED: Handle search with ALL filters - uses /properties/search endpoint
  async function handleSearch(filters) {
    try {
      console.log("🔍 SearchBar sent filters:", filters);
      setLoading(true);
      setSearchActive(true);
      setErrorMessage("");

      // Build search query display
      let displayText = [];
      if (filters.location && filters.location.trim()) {
        displayText.push(filters.location);
      }
      if (filters.number_of_guests && filters.number_of_guests > 1) {
        displayText.push(`${filters.number_of_guests} guests`);
      }
      setSearchQuery(displayText.length > 0 ? displayText.join(" • ") : "Search");

      // Build query parameters
      const params = new URLSearchParams();

      if (filters.location && filters.location.trim()) {
        params.append("location", filters.location.trim());
        console.log("✅ Added location:", filters.location.trim());
      }

      // ✅ NEW: Add number_of_guests filter
      if (filters.number_of_guests && filters.number_of_guests > 0) {
        params.append("number_of_guests", filters.number_of_guests);
        console.log("✅ Added number_of_guests:", filters.number_of_guests);
      }

      if (filters.startDate) {
        params.append("startDate", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate.toISOString());
      }

      const fullUrl = `/properties/search?${params.toString()}`;
      console.log("📡 API URL:", fullUrl);

      // ✅ UPDATED: Use /properties/search endpoint (not /search)
      const { data } = await api.get(fullUrl);

      console.log("✅ API Response:", data);

      const properties = data.properties || [];
      
      if (properties.length === 0) {
        console.warn("⚠️ No properties found!");
        setErrorMessage("No properties found matching your search");
        toast.error("No properties found for this search");
      } else {
        console.log("✨ Found", properties.length, "properties");
      }

      setGroupedProperties(groupPropertiesByLocation(properties));
    } catch (err) {
      console.error("❌ Search failed:", err);
      setErrorMessage(`Error: ${err.response?.data?.error || err.message}`);
      toast.error("Failed to search properties");
      setGroupedProperties({});
    } finally {
      setLoading(false);
    }
  }

  // ✅ Load initial properties
  useEffect(() => {
    (async () => {
      console.log("📍 Loading initial properties...");
      const userCity = await getUserCity();
      console.log("📍 User city:", userCity);
      setCity(userCity);

      try {
        console.log("📍 Fetching properties for city:", userCity);
        
        // ✅ UPDATED: Use /properties/search endpoint
        const { data } = await api.get("/properties/search", {
          params: { location: userCity.toLowerCase().trim() },
        });

        console.log("📍 Response:", data);

        const properties = data.properties || [];

        if (properties.length) {
          console.log("📍 Using city-based properties");
          setGroupedProperties(groupPropertiesByLocation(properties));
        } else {
          console.log("📍 No properties for city, fetching all...");
          
          // ✅ Fallback: Get all properties
          const { data: all } = await api.get("/properties/search");
          const allProperties = all.properties || [];
          console.log("📍 All properties count:", allProperties.length);
          
          setGroupedProperties(groupPropertiesByLocation(allProperties));
        }
      } catch (err) {
        console.error("❌ Error loading properties:", err);
        setErrorMessage("Failed to load properties");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full bg-white">
      
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 py-3 sm:py-6 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">⚠️ {errorMessage}</p>
          </div>
        )}
        
        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : Object.keys(groupedProperties).length > 0 ? (
          <div className="space-y-8 sm:space-y-12">
            
            {/* Title */}
            {!searchActive && (
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Stays in {city}
                </h1>
              </div>
            )}

            {/* Search Active Title */}
            {searchActive && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Results for "{searchQuery}"
                </h1>
                <button
                  onClick={() => {
                    setSearchActive(false);
                    setSearchQuery("");
                    setErrorMessage("");
                    window.location.href = "/";
                  }}
                  className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Sections by Location */}
            {Object.entries(groupedProperties).map(([location, properties]) => (
              <section key={location} className="space-y-3 sm:space-y-4">
                
                {/* Section Title */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {location}
                </h2>

                {/* Carousel Container */}
                <div className="relative group">
                  
                  {/* Scrollable Container */}
                  <div
                    ref={(el) => (scrollRefs.current[location] = el)}
                    className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scroll-smooth pb-3 sm:pb-4 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {properties.map((p) => (
                      <div
                        key={p.id}
                        className="flex-shrink-0 w-64 sm:w-72 lg:w-80"
                      >
                        <PropertyCard p={p} />
                      </div>
                    ))}
                  </div>

                  {/* Left Arrow */}
                  <button
                    onClick={() => scroll(location, "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 hover:border-gray-500 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} sm:size={20} className="text-gray-900" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scroll(location, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 hover:border-gray-500 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} sm:size={20} className="text-gray-900" />
                  </button>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">No properties found</h2>
            <p className="text-gray-600 mt-2">
              {searchActive 
                ? "Try adjusting your search criteria" 
                : "No properties available in your area"}
            </p>
            {searchActive && (
              <button
                onClick={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                  setErrorMessage("");
                  window.location.href = "/";
                }}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold text-sm"
              >
                Try Different Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}