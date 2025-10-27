import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonCard from "../components/SkeletonCard.jsx";

export default function Home() {
  const [city, setCity] = useState("your area");
  const [popular, setPopular] = useState([]);
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 relative pb-20">
      <div className="sticky top-[72px] bg-white z-40 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <SearchBar onSearch={handleSearch} />
      </div>

      {Object.keys(groupedProperties).length > 0 ? (
        Object.entries(groupedProperties).map(([location, properties]) => (
          <div key={location} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {location}
                <span className="ml-2 text-lg font-normal text-gray-600">›</span>
              </h2>
            </div>

            <div className="relative group/section">
              {properties.length > 4 && (
                <button
                  onClick={() => scroll(location, "left")}
                  className="absolute left-0 top-1/3 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2.5 opacity-0 group-hover/section:opacity-100 hover:scale-110 transition-all hidden sm:block"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
              )}

              {properties.length > 4 && (
                <button
                  onClick={() => scroll(location, "right")}
                  className="absolute right-0 top-1/3 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2.5 opacity-0 group-hover/section:opacity-100 hover:scale-110 transition-all hidden sm:block"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}

              <div
                ref={(el) => (scrollRefs.current[location] = el)}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
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

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}