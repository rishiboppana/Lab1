import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");

  async function fetchData() {
    const res = await api.get("/properties/search", { params: { location: search } });
    setListings(res.data.properties);
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Search location..."
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchData} className="bg-red-500 text-white px-4 rounded">
          Search
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((p) => (
          <Link key={p.id} to={`/property/${p.id}`} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md">
            <img
              src={p.images?.length ? `http://localhost:4000${JSON.parse(p.images)[0]}` : "https://placehold.co/300x200"}
              alt={p.title}
              className="h-40 w-full object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.location}</p>
              <p className="font-semibold">${p.price_per_night} / night</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
