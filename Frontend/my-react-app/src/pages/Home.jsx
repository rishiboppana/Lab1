import { useEffect, useState } from "react";
import { api } from "../api/axios";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchList(params = {}) {
    setLoading(true);
    try {
      const { data } = await api.get("/properties/search", { params });
      setList(data.properties || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  return (
    <div className="space-y-4">
      <div className="sticky top-[64px] bg-white z-40 py-3">
        <SearchBar onSearch={fetchList} />
      </div>

      {loading && <div className="text-center py-10">Loading listings…</div>}

      {!loading && list.length === 0 && (
        <div className="text-center text-gray-600 py-10">No places match your search.</div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
