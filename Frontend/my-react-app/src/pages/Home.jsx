import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import SectionBlock from "../components/SectionBlock";
import { Map } from "lucide-react";
import MapView from "../components/MapView";
import SkeletonCard from "../components/SkeletonCard.jsx";

export default function Home() {
  const [city, setCity] = useState("your area");
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 600;
    container.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
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
      setPopular(data.properties || []);
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
        if (data.properties?.length) setPopular(data.properties);
        else {
          const { data: all } = await api.get("/properties/search");
          setPopular(all.properties);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative">

      <div className="sticky top-[72px] bg-white z-40 py-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      <button
        onClick={() => setShowMap(!showMap)}
        className="fixed bottom-6 right-6 bg-airbnb-red text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#E31C5F]"
      >
        {showMap ? "Show list" : "Show map"} <Map size={16} className="inline ml-1" />
      </button>

      <SectionBlock title={`Popular homes in ${city}`}>
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
          >
            →
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          >
            {popular.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </SectionBlock>

      {showMap && <MapView listings={popular} />}
    </div>
  );
}