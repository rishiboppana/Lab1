import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Owner() {
  const [list, setList] = useState([]);

  async function load() {
    try {
      const { data } = await api.get("/properties/owner/list");
      setList(data.properties || []);
    } catch (err) {
      console.error("Failed to load listings:", err);
      toast.error("Failed to load your listings");
    }
  }

  async function remove(id) {
    if (!confirm("Delete listing?")) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success("Listing deleted");
      await load();
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete listing");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Listings</h1>
        <Link
          to="/post"
          className="bg-airbnb-red text-white px-4 py-2 rounded-full hover:bg-[#E31C5F] transition"
        >
          + New Listing
        </Link>
      </div>

      {/* ---------- Listings Grid ---------- */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {list.map((p) => {
          // Safe image parsing
          let imgs = [];
          try {
            if (typeof p.images === "string") {
              const parsed = JSON.parse(p.images);
              imgs = Array.isArray(parsed) ? parsed : [parsed];
            } else if (Array.isArray(p.images)) {
              imgs = p.images;
            }
          } catch {
            imgs = [p.images]; // fallback if not JSON
          }

          const firstImage =
            imgs && imgs.length > 0
              ? imgs[0].startsWith("http")
                ? imgs[0]
                : `http://localhost:4000${imgs[0]}`
              : "https://placehold.co/600x400?text=No+Image";

          return (
            <div
              key={p.id}
              className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img
                src={firstImage}
                alt={p.title}
                onError={(e) =>
                  (e.target.src = "https://placehold.co/600x400?text=No+Image")
                }
                className="h-44 w-full object-cover"
              />
              <div className="p-3">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-600">{p.location}</div>
                <p className="text-sm mt-1">
                  ${p.price_per_night} / night
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/property/${p.id}`}
                    className="border px-3 py-1 rounded hover:bg-gray-100"
                  >
                    View
                  </Link>
                  <Link
                    to={`/edit-property/${p.id}`}
                    className="border px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    className="border px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Empty State ---------- */}
      {list.length === 0 && (
        <div className="text-gray-600 text-center py-10">
          No listings yet. Click <span className="font-semibold">New Listing</span> to add one!
        </div>
      )}
    </div>
  );
}
