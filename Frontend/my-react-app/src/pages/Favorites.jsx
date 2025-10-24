import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [fav, setFav] = useState([]);

  useEffect(() => {
    api.get("/favorites").then(r => setFav(r.data.favorites));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fav.map(p => (
          <Link key={p.id} to={`/property/${p.id}`} className="border rounded-lg overflow-hidden hover:shadow">
            <img src={`http://localhost:4000${JSON.parse(p.images)[0]}`} alt="" className="h-40 w-full object-cover" />
            <div className="p-3">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
