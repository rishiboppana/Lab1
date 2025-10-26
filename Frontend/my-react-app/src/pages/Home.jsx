import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { Map, ChevronLeft, ChevronRight } from "lucide-react";
import MapView from "../components/MapView";
import SkeletonCard from "../components/SkeletonCard.jsx";

export default function Home() {
  const [city, setCity] = useState("your area");
  const [popular, setPopular] = useState([]);
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const scrollRefs = useRef({});

  const scroll = (location, dir) => {
    const container = scrollRefs.current[location];
    if (!container) return;
    const scrollAmount = 500;
    container.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Group properties by location
  const groupPropertiesByLocation = (properties) => {
    const grouped = {};
    properties.forEach((property) => {
      const loc = property.location || "Other";
      if (!grouped[loc]) {
        grouped[loc] = [];
      }
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
      const { data } = await api.get("/properties/search", {
        params: { location },
      });
      const properties = data.properties || [];
      setPopular(properties);
      setGroupedProperties(groupPropertiesByLocation(properties));
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    (async () => {
      const userCity = await getUserCity();
      setCity(userCity);

      try {
        const { data } = await api.get("/properties/search", {
          params: { location: userCity },
        });
        const properties = data.properties || [];

        if (properties.length) {
          setPopular(properties);
          setGroupedProperties(groupPropertiesByLocation(properties));
        } else {
          const { data: all } = await api.get("/properties/search");
          const allProperties = all.properties || [];
          setPopular(allProperties);
          setGroupedProperties(groupPropertiesByLocation(allProperties));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="max-w-[1760px] mx-auto px-6 sm:px-10 md:px-20 relative pb-20">
      {/* Search Bar */}
      <div className="sticky top-[72px] bg-white z-40 py-4 -mx-6 px-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Map Toggle Button */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-gray-800 transition-all z-50 flex items-center gap-2"
      >
        <Map size={18} />
        <span className="font-medium">{showMap ? "Show list" : "Show map"}</span>
      </button>

      {/* Grouped Properties by Location */}
      {Object.keys(groupedProperties).length > 0 ? (
        Object.entries(groupedProperties).map(([location, properties]) => (
          <div key={location} className="mb-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {location}
                <span className="ml-2 text-lg font-normal text-gray-600">›</span>
              </h2>
            </div>

            {/* Scrollable Property Cards */}
            <div className="relative group/section">
              {/* Left Scroll Button */}
              {properties.length > 4 && (
                <button
                  onClick={() => scroll(location, "left")}
                  className="absolute left-0 top-1/3 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2.5 opacity-0 group-hover/section:opacity-100 hover:scale-110 transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
              )}

              {/* Right Scroll Button */}
              {properties.length > 4 && (
                <button
                  onClick={() => scroll(location, "right")}
                  className="absolute right-0 top-1/3 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2.5 opacity-0 group-hover/section:opacity-100 hover:scale-110 transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={(el) => (scrollRefs.current[location] = el)}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {properties.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No properties found</p>
        </div>
      )}

      {/* Map View */}
      {showMap && (
        <div className="mt-8">
          <MapView listings={popular} />
        </div>
      )}

      {/* Hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}