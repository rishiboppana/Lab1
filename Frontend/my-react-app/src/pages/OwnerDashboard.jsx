import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load owner properties + bookings
  useEffect(() => {
    if (!user || !user.id) {
      console.log("❌ No user or user.id:", user);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        console.log("🔍 Fetching data for user.id:", user.id);

        const [propsRes, bookingsRes] = await Promise.all([
          api.get(`/owner/properties/${user.id}`),
          api.get(`/owner/bookings/${user.id}`),
        ]);

        console.log("✅ Properties response:", propsRes.data);
        console.log("✅ Bookings response:", bookingsRes.data);

        setProperties(propsRes.data.properties || []);
        setBookings(bookingsRes.data.bookings || []);
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
        console.error("❌ Error response:", err.response?.data);
        console.error("❌ Error status:", err.response?.status);
        toast.error(err.response?.data?.error || "Failed to load owner dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // 🔹 Delete property
  async function deleteProperty(id) {
    if (!confirm("Delete this property?")) return;
    try {
      await api.delete(`/owner/property/${id}`);
      toast.success("Property deleted");
      setProperties((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete property");
    }
  }

  // 🔹 Update booking status (Accept / Cancel)
  async function updateBookingStatus(id, action) {
    try {
      await api.patch(`/bookings/${id}/${action}`);
      toast.success(`Booking ${action === "accept" ? "accepted" : "cancelled"}!`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: action === "accept" ? "Accepted" : "Cancelled" } : b
        )
      );
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error("Failed to update booking");
    }
  }

  // ✅ Helper to get image URL
  const getImageUrl = (images) => {
    try {
      const imgs = typeof images === "string" ? JSON.parse(images) : images;
      if (Array.isArray(imgs) && imgs.length > 0) {
        const firstImg = imgs[0];
        return firstImg.startsWith("http") ? firstImg : `http://localhost:4000${firstImg}`;
      }
    } catch (err) {
      console.error("Error parsing images:", err);
    }
    return "https://placehold.co/600x400?text=No+Image";
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      <h1 className="text-2xl font-semibold mb-6">Owner Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">My Properties</h2>
        <Link
          to="/add-property"
          className="bg-airbnb-red text-white px-3 py-2 rounded-full hover:bg-[#E31C5F] transition"
        >
          + Add Property
        </Link>
      </div>

      {/* ---------- Property List ---------- */}
      {properties.length === 0 ? (
        <p className="text-gray-500 mb-6">You haven't listed any properties yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div key={p.id} className="border rounded-2xl overflow-hidden shadow-sm">
              <img
                src={getImageUrl(p.images)}
                alt={p.title}
                className="aspect-[4/3] object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.location}</p>
                <p className="text-sm mt-1">${p.price_per_night}/night</p>
                <p className="text-sm text-gray-500 mt-1">
                  ⭐ {p.avg_rating ? parseFloat(p.avg_rating).toFixed(1) : "–"} ({p.review_count ?? 0})
                </p>
                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/edit-property/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProperty(p.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Booking Management ---------- */}
      <h2 className="text-lg font-semibold mt-10 mb-3">Booking Requests</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-3 text-left">Guest</th>
                <th className="py-2 px-3 text-left">Property</th>
                <th className="py-2 px-3 text-center">Check-in</th>
                <th className="py-2 px-3 text-center">Check-out</th>
                <th className="py-2 px-3 text-center">Total</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 px-3">{b.guest_name}</td>
                  <td className="py-2 px-3">{b.title}</td>
                  <td className="py-2 px-3 text-center">
                    {new Date(b.check_in).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {new Date(b.check_out).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-center">${b.total_price}</td>
                  <td
                    className={`py-2 px-3 text-center font-semibold ${
                      b.status === "Accepted"
                        ? "text-green-600"
                        : b.status === "Cancelled"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {b.status}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {b.status === "Pending" && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => updateBookingStatus(b.id, "accept")}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "cancel")}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}