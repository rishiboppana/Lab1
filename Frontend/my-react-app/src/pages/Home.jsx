import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [city, setCity] = useState("your area");
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState("lg");

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

    // Adjust scroll amount based on screen size
    let scrollAmount = 350; // Default for desktop
    if (screenSize === "sm") scrollAmount = 280; // Mobile: 1 card + gap
    else if (screenSize === "md") scrollAmount = 320; // Tablet: 1.5 cards
    else scrollAmount = 380; // Desktop: 2 cards

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

  async function handleSearch({ location }) {
    try {
      setLoading(true);
      setSearchActive(true);
      setSearchQuery(location);
      
      const { data } = await api.get("/properties/search", {
        params: { location: location.toLowerCase().trim() },
      });
      const properties = data.properties || [];
      setGroupedProperties(groupPropertiesByLocation(properties));
    } catch (err) {
      console.error("Search error:", err);
      setGroupedProperties({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const userCity = await getUserCity();
      setCity(userCity);

      try {
        const { data } = await api.get("/properties/search", {
          params: { location: userCity.toLowerCase().trim() },
        });
        const properties = data.properties || [];

        if (properties.length) {
          setGroupedProperties(groupPropertiesByLocation(properties));
        } else {
          const { data: all } = await api.get("/properties/search");
          const allProperties = all.properties || [];
          setGroupedProperties(groupPropertiesByLocation(allProperties));
        }
      } catch (err) {
        console.error(err);
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
        
        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
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
            {searchActive && (
              <button
                onClick={() => {
                  setSearchActive(false);
                  setSearchQuery("");
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