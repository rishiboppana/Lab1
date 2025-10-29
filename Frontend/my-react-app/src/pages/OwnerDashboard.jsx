import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your properties and bookings</p>
          </div>
          <Link
            to="/add-property"
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold whitespace-nowrap"
          >
            <Plus size={20} />
            Add Property
          </Link>
        </div>

        {/* Tabs for Mobile */}
        <div className="flex gap-2 mb-6 sm:hidden">
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "properties"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-900 border border-gray-300"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "bookings"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-900 border border-gray-300"
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Properties Section */}
        <div className={`${activeTab === "bookings" && window.innerWidth < 768 ? "hidden" : ""}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Properties</h2>

            {properties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">You haven't listed any properties yet.</p>
                <Link
                  to="/add-property"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  <Plus size={20} />
                  Create Your First Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    {/* Image */}
                    <div className="relative h-48 sm:h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={getImageUrl(p.images)}
                        alt={p.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-3 space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">{p.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{p.location}</p>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm">
                        <p className="text-gray-900 font-semibold">${p.price_per_night}/night</p>
                        <div className="flex gap-2 text-gray-600">
                          <span>{p.bedrooms} beds</span>
                          <span>•</span>
                          <span>{p.bathrooms} baths</span>
                        </div>
                        <p className="text-yellow-500">
                          ⭐ {p.avg_rating ? parseFloat(p.avg_rating).toFixed(1) : "–"} ({p.review_count ?? 0})
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Link
                          to={`/edit-property/${p.id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition font-semibold text-xs sm:text-sm"
                        >
                          <Edit2 size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                        <button
                          onClick={() => deleteProperty(p.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition font-semibold text-xs sm:text-sm"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings Section */}
        <div className={`${activeTab === "properties" && window.innerWidth < 768 ? "hidden" : ""}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Requests</h2>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No bookings yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 text-left font-semibold">Guest</th>
                      <th className="py-3 px-4 text-left font-semibold">Property</th>
                      <th className="py-3 px-4 text-center font-semibold">Check-in</th>
                      <th className="py-3 px-4 text-center font-semibold">Check-out</th>
                      <th className="py-3 px-4 text-center font-semibold">Total</th>
                      <th className="py-3 px-4 text-center font-semibold">Status</th>
                      <th className="py-3 px-4 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{b.guest_name}</td>
                        <td className="py-3 px-4">{b.title}</td>
                        <td className="py-3 px-4 text-center text-sm">
                          {new Date(b.check_in).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {new Date(b.check_out).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">${b.total_price}</td>
                        <td className={`py-3 px-4 text-center font-semibold text-sm ${
                          b.status === "Accepted"
                            ? "text-green-600"
                            : b.status === "Cancelled"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}>
                          {b.status}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {b.status === "Pending" && (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => updateBookingStatus(b.id, "accept")}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateBookingStatus(b.id, "cancel")}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
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

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl shadow-lg p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">{b.guest_name}</p>
                      <p className="text-sm text-gray-600">{b.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="font-semibold text-gray-900">Check-in</p>
                        <p>{new Date(b.check_in).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Check-out</p>
                        <p>{new Date(b.check_out).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">${b.total_price}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : b.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {b.status === "Pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => updateBookingStatus(b.id, "accept")}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition font-semibold text-sm"
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "cancel")}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition font-semibold text-sm"
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}