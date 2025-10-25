import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Wishlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/favorites").then((res) => setList(res.data.favorites || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Wishlist</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {list.map((p) => (
          <div key={p.id} className="border rounded-xl overflow-hidden">
            <img
              src={JSON.parse(p.images || "[]")[0]}
              className="h-64 w-full object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
