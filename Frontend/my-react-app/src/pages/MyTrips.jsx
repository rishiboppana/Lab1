import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";

export default function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "upcoming", "past", "pending", "cancelled"

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const { data } = await api.get("/bookings/my-trips");
      console.log("📅 Loaded trips:", data.trips);
      setTrips(data.trips || []);
    } catch (err) {
      console.error("Error loading trips:", err);
      toast.error("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  }

  async function cancelTrip(id) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking cancelled successfully");
      loadTrips(); // Reload trips
    } catch (err) {
      console.error("Error cancelling trip:", err);
      toast.error(err.response?.data?.error || "Failed to cancel booking");
    }
  }

  // Helper to get image URL
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

  // Helper to determine trip status
  const getTripStatus = (trip) => {
    const checkIn = new Date(trip.check_in);
    const checkOut = new Date(trip.check_out);
    const today = new Date();

    if (trip.status === "Cancelled") return "cancelled";
    if (trip.status === "Pending") return "pending";
    if (isPast(checkOut)) return "past";
    if (isFuture(checkIn)) return "upcoming";
    if (checkIn <= today && today <= checkOut) return "ongoing";
    return "upcoming";
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    if (filter === "all") return true;
    const status = getTripStatus(trip);

    if (filter === "upcoming") return status === "upcoming" || status === "ongoing";
    if (filter === "past") return status === "past";
    if (filter === "pending") return status === "pending";
    if (filter === "cancelled") return status === "cancelled";

    return true;
  });

  // Group trips by status
  const tripCounts = {
    all: trips.length,
    upcoming: trips.filter(t => ["upcoming", "ongoing"].includes(getTripStatus(t))).length,
    past: trips.filter(t => getTripStatus(t) === "past").length,
    pending: trips.filter(t => getTripStatus(t) === "pending").length,
    cancelled: trips.filter(t => getTripStatus(t) === "cancelled").length,
  };

  if (loading) {
    return <div className="text-center py-10">Loading your trips...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      <h1 className="text-3xl font-bold mb-6">My Trips</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All Trips" },
          { key: "upcoming", label: "Upcoming" },
          { key: "past", label: "Past" },
          { key: "pending", label: "Pending" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              filter === tab.key
                ? "bg-airbnb-red text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label} ({tripCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">
            {filter === "all"
              ? "You haven't made any bookings yet."
              : `No ${filter} trips found.`}
          </p>
          <Link
            to="/"
            className="bg-airbnb-red text-white px-6 py-3 rounded-full hover:bg-[#E31C5F] transition inline-block"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const status = getTripStatus(trip);
            const checkIn = new Date(trip.check_in);
            const checkOut = new Date(trip.check_out);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={trip.id}
                className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3">
                    <img
                      src={getImageUrl(trip.images)}
                      alt={trip.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{trip.title}</h3>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin size={16} /> {trip.location}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          status === "ongoing"
                            ? "bg-blue-100 text-blue-700"
                            : status === "upcoming"
                            ? "bg-green-100 text-green-700"
                            : status === "past"
                            ? "bg-gray-100 text-gray-700"
                            : status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status === "ongoing"
                          ? "🏠 Ongoing"
                          : status === "upcoming"
                          ? "✈️ Upcoming"
                          : status === "past"
                          ? "✓ Completed"
                          : status === "pending"
                          ? "⏳ Pending"
                          : "✕ Cancelled"}
                      </span>
                    </div>

                    {/* Trip Details */}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          <strong>Check-in:</strong> {format(checkIn, "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          <strong>Check-out:</strong> {format(checkOut, "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                          {nights} night{nights !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>
                          <strong>Total:</strong> ${trip.total_price}
                        </span>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <p className="text-xs text-gray-500 mb-3">
                      Booked on {format(new Date(trip.created_at), "MMM d, yyyy")}
                      {trip.owner_name && ` • Host: ${trip.owner_name}`}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      <Link
                        to={`/property/${trip.property_id}`}
                        className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition text-sm"
                      >
                        View Property
                      </Link>

                      {/* Only show cancel button for Pending or Upcoming Accepted bookings */}
                      {(status === "pending" || (status === "upcoming" && trip.status === "Accepted")) && (
                        <button
                          onClick={() => cancelTrip(trip.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition text-sm"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {/* Show "Leave Review" for completed trips */}
                      {status === "past" && trip.status === "Accepted" && (
                        <Link
                          to={`/property/${trip.property_id}#reviews`}
                          className="px-4 py-2 bg-airbnb-red text-white rounded-full hover:bg-[#E31C5F] transition text-sm"
                        >
                          Leave Review
                        </Link>
                      )}

                      {/* Show status message for pending */}
                      {status === "pending" && (
                        <p className="text-sm text-yellow-600 flex items-center">
                          ⏳ Awaiting owner approval
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}