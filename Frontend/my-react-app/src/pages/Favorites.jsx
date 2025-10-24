import { useEffect, useState } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";

export default function Favorites() {
  const [list, setList] = useState([]);
  useEffect(()=>{ api.get("/favorites").then(r=>setList(r.data.favorites||[])); },[]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Your favourites</h1>
      {list.length===0 && <div className="text-gray-600">No favorites yet.</div>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {list.map(p => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
