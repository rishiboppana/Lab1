import { useEffect, useState } from "react";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    try {
      const { data } = await api.get("/bookings/owner", { withCredentials: true });
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(id, action) {
    try {
      await api.patch(`/bookings/${id}/${action}`, {}, { withCredentials: true });
      toast.success(`Booking ${action === "accept" ? "accepted" : "cancelled"}!`);
      await loadBookings();
    } catch (err) {
      toast.error("Action failed");
      console.error(err);
    }
  }

  if (loading) return <div className="text-center py-10">Loading bookings...</div>;
  if (!bookings.length) return <div className="text-center py-10 text-gray-500">No bookings found.</div>;

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold mb-4">Incoming Booking Requests</h1>

      <div className="space-y-4">
        {bookings.map((b) => {
          let imgs = [];
          try {
            imgs = typeof b.images === "string" ? JSON.parse(b.images) : b.images;
          } catch {}
          const img = imgs?.[0]?.startsWith("http")
            ? imgs[0]
            : imgs?.[0]
            ? `http://localhost:4000${imgs[0]}`
            : "https://placehold.co/600x400?text=No+Image";

          return (
            <div key={b.id} className="flex flex-col md:flex-row gap-4 border rounded-xl p-4 shadow-sm">
              <img src={img} alt={b.title} className="w-full md:w-48 h-36 object-cover rounded-lg" />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{b.title}</h2>
                <p className="text-sm text-gray-600">{b.location}</p>
                <p className="text-sm mt-1">
                  <strong>Guest:</strong> {b.traveler_name} ({b.traveler_email})
                </p>
                <p className="text-sm">
                  <strong>Check-in:</strong> {b.check_in} | <strong>Check-out:</strong> {b.check_out}
                </p>
                <p className="text-sm"><strong>Total:</strong> ${b.total_price}</p>
                <p className={`mt-1 font-semibold ${b.status === "Accepted" ? "text-green-600" : b.status === "Cancelled" ? "text-red-500" : "text-yellow-500"}`}>
                  Status: {b.status}
                </p>

                {b.status === "Pending" && (
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => updateStatus(b.id, "accept")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancel")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
