import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Owner() {
  const [list, setList] = useState([]);

  async function load() {
    const { data } = await api.get("/properties/owner/list");
    setList(data.properties || []);
  }
  async function remove(id) {
    if (!confirm("Delete listing?")) return;
    await api.delete(`/properties/${id}`);
    load();
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your listings</h1>
        <Link to="/post" className="bg-red-500 text-white px-3 py-2 rounded">New listing</Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {list.map(p=>(
          <div key={p.id} className="border rounded-xl overflow-hidden">
            <img
              src={(JSON.parse(p.images||"[]")[0] && `http://localhost:4000${JSON.parse(p.images)[0]}`) || "https://placehold.co/600x400"}
              className="h-40 w-full object-cover"
            />
            <div className="p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">{p.location}</div>
              <div className="flex gap-2 mt-2">
                <Link to={`/property/${p.id}`} className="border px-3 py-1 rounded">View</Link>
                <button onClick={()=>remove(p.id)} className="border px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length===0 && <div className="text-gray-600">No listings yet.</div>}
    </div>
  );
}
