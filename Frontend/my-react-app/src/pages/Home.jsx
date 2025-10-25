import { useEffect, useState } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import SectionBlock from "../components/SectionBlock";

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

  // Fake grouping for now
  const la = list.slice(0, 5);
  const sd = list.slice(5, 10);
  const oak = list.slice(10, 15);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="sticky top-[72px] bg-white z-40 py-4">
        <SearchBar onSearch={fetchList} />
      </div>

      {loading && <p className="text-center py-10 text-airbnb-gray">Loading places…</p>}
      {!loading && list.length === 0 && (
        <p className="text-center py-10 text-airbnb-gray">No places match your search.</p>
      )}

      {!loading && (
        <>
          <SectionBlock title="Popular homes in Los Angeles">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {la.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          </SectionBlock>

          <SectionBlock title="Available next month in San Diego">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {sd.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          </SectionBlock>

          <SectionBlock title="Stay in Oakland">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {oak.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          </SectionBlock>
        </>
      )}
    </div>
  );
}
