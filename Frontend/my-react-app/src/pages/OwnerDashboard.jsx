import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get(`/owner/properties/${user.id}`).then((res) => setProperties(res.data.properties));
    api.get(`/owner/bookings/${user.id}`).then((res) => setBookings(res.data.bookings));
  }, [user]);

  async function deleteProperty(id) {
    if (!confirm("Delete this property?")) return;
    await api.delete(`/owner/property/${id}`);
    toast.success("Property deleted");
    setProperties((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      <h1 className="text-2xl font-semibold mb-6">Owner Dashboard</h1>

      {/* ---------- Properties ---------- */}
      <h2 className="text-lg font-semibold mb-3">My Properties</h2>
      {properties.length === 0 && (
        <p className="text-gray-500 mb-6">You haven’t listed any properties yet.</p>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={
                p.images && p.images.startsWith("[")
                  ? JSON.parse(p.images)[0]
                  : "https://placehold.co/600x400?text=No+Image"
              }
              alt={p.title}
              className="aspect-[4/3] object-cover"
            />
            <div className="p-3">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.location}</p>
              <p className="text-sm mt-1">${p.price_per_night}/night</p>
              <p className="text-sm text-gray-500 mt-1">
                ⭐ {p.avg_rating ?? "–"} ({p.review_count ?? 0})
              </p>
              <button
                onClick={() => deleteProperty(p.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Bookings ---------- */}
      <h2 className="text-lg font-semibold mt-10 mb-3">Recent Bookings</h2>
      {bookings.length === 0 && (
        <p className="text-gray-500">No bookings yet.</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse mt-2">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-3 text-left">Guest</th>
              <th className="py-2 px-3 text-left">Property</th>
              <th className="py-2 px-3">Check-in</th>
              <th className="py-2 px-3">Check-out</th>
              <th className="py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="py-2 px-3">{b.guest_name}</td>
                <td className="py-2 px-3">{b.title}</td>
                <td className="py-2 px-3 text-center">{b.check_in}</td>
                <td className="py-2 px-3 text-center">{b.check_out}</td>
                <td className="py-2 px-3 text-center">${b.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
