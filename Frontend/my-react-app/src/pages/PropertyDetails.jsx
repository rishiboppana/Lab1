import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { Star, Home, BedDouble, Bath, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import { useAuth } from "../context/AuthContext";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]); // ✅ Only accepted
  const [myBookings, setMyBookings] = useState([]); // ✅ User's bookings (all statuses)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const { user } = useAuth();

  const [range, setRange] = useState([
    { startDate: new Date(), endDate: addDays(new Date(), 3), key: "selection" },
  ]);

  // ✅ Load property info, bookings, and reviews
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 Fetching property ID:", id);
        console.log("👤 Current user:", user);

        const res = await api.get(`/properties/${id}`);
        const p = res.data.property;
        const allBookings = res.data.bookings || [];

        console.log("📦 All bookings received:", allBookings);

        // Parse images
        try {
          p.images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch {
          p.images = [];
        }

        // Parse amenities
        try {
          p.amenities =
            typeof p.amenities === "string" && p.amenities.startsWith("[")
              ? JSON.parse(p.amenities)
              : Array.isArray(p.amenities)
              ? p.amenities
              : (p.amenities || "").split(",").map((a) => a.trim());
        } catch {
          p.amenities = [];
        }

        setProperty(p);

        // ✅ Split bookings
        const accepted = allBookings.filter(b => b.status === "Accepted");
        console.log("✅ Accepted bookings (will block dates):", accepted);
        setAcceptedBookings(accepted);

        // ✅ Get user's own bookings (all statuses)
        if (user && user.id) {
          const userBookings = allBookings.filter(b => b.user_id === user.id);
          console.log("👤 User's bookings:", userBookings);
          setMyBookings(userBookings);
        } else {
          console.log("⚠️ No user logged in");
          setMyBookings([]);
        }

        // Load reviews
        const rev = await api.get(`/reviews/${id}`);
        setReviews(rev.data.reviews);
      } catch (err) {
        console.error("❌ Error loading property:", err);
        toast.error("Failed to load property details");
      }
    }

    fetchData();
  }, [id, user]);

  if (!property)
    return (
      <div className="text-center py-10 text-airbnb-gray">
        Loading property details...
      </div>
    );

  const nights =
    (range[0].endDate - range[0].startDate) / (1000 * 60 * 60 * 24);
  const total = nights * (property?.price_per_night ?? 0);

  const avg = property.avg_rating ?? "–";
  const count = property.review_count ?? 0;

  // ✅ Check if selected dates overlap with ACCEPTED bookings
  const isDateBlocked = () => {
    const { startDate, endDate } = range[0];

    return acceptedBookings.some((booking) => {
      const bookingStart = new Date(booking.check_in);
      const bookingEnd = new Date(booking.check_out);

      // Check if there's any overlap
      return (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      );
    });
  };

  async function handleReserve() {
    try {
      if (!user) return toast.error("Please log in first");

      // ✅ Check if dates are blocked
      if (isDateBlocked()) {
        return toast.error("These dates are already booked. Please choose different dates.");
      }

      const check_in = format(range[0].startDate, "yyyy-MM-dd");
      const check_out = format(range[0].endDate, "yyyy-MM-dd");

      await api.post("/bookings", {
        property_id: property.id,
        user_id: user.id,
        check_in,
        check_out,
      });

      toast.success("Booking request sent! Waiting for owner approval.");

      // ✅ Reload data
      const res = await api.get(`/properties/${id}`);
      const allBookings = res.data.bookings || [];

      const accepted = allBookings.filter(b => b.status === "Accepted");
      setAcceptedBookings(accepted);

      if (user && user.id) {
        const userBookings = allBookings.filter(b => b.user_id === user.id);
        setMyBookings(userBookings);
      }
    } catch (err) {
      if (err.response?.status === 400)
        toast.error("These dates are already booked.");
      else toast.error("Failed to create booking");
      console.error(err);
    }
  }

  // ✅ Generate disabled dates from ACCEPTED bookings only
  const disabledDates = acceptedBookings.flatMap((booking) => {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    const dates = [];

    let current = new Date(start);
    while (current < end) { // Changed <= to < (don't include checkout day)
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  });

  console.log("🚫 Disabled dates:", disabledDates);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      {/* ---------- Image Gallery ---------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
        {property.images?.length ? (
          property.images.slice(0, 5).map((img, i) => (
            <img
              key={i}
              src={
                img.startsWith("http")
                  ? img
                  : `http://localhost:4000${img.startsWith("/") ? img : "/" + img}`
              }
              alt={property.title}
              onError={(e) => (e.target.src = "https://placehold.co/600x400")}
              className={`object-cover w-full h-64 ${
                i === 0 ? "md:col-span-2 lg:col-span-2 h-96" : ""
              }`}
            />
          ))
        ) : (
          <img
            src="https://placehold.co/600x400?text=No+Image"
            alt="placeholder"
            className="object-cover w-full h-96 rounded-2xl"
          />
        )}
      </div>

      {/* ---------- Header Info ---------- */}
      <div className="flex justify-between items-start mt-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Home size={16} /> {property.type || "Property"} •
            <BedDouble size={16} /> {property.bedrooms || 0} bed(s) •
            <Bath size={16} /> {property.bathrooms || 0} bath(s)
          </p>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Star size={14} className="text-airbnb-red mr-1" />
            <span className="font-medium">{avg}</span>
            <span className="mx-1">•</span>
            <span>{count} reviews</span>
            <span className="mx-1">•</span>
            <span>{property.location}</span>
          </div>
        </div>

        {/* ---------- Booking Box ---------- */}
        <div className="border rounded-2xl p-4 shadow-sm text-center w-full md:w-[320px]">
          <p className="text-xl font-semibold text-airbnb-dark">
            ${property?.price_per_night ?? 0}
            <span className="text-sm text-gray-500"> / night</span>
          </p>

          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
            rangeColors={["#FF385C"]}
            minDate={new Date()}
            disabledDates={disabledDates}
            className="mt-2"
          />

          <p className="text-sm text-gray-600 mt-2">
            {nights} night{nights !== 1 && "s"} • Total{" "}
            <span className="font-semibold text-black">
              ${total.toFixed(2)}
            </span>
          </p>

          <button
            onClick={handleReserve}
            disabled={isDateBlocked()}
            className={`mt-3 w-full rounded-full py-2 transition ${
              isDateBlocked()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-airbnb-red text-white hover:bg-[#E31C5F]"
            }`}
          >
            {isDateBlocked() ? "Dates Not Available" : "Reserve"}
          </button>

          {/* ---------- User's Own Bookings ---------- */}
          {myBookings.length > 0 && (
            <div className="mt-4 text-left border-t pt-3">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Calendar size={16} /> Your Bookings
              </h3>
              <ul className="text-xs space-y-2">
                {myBookings.map((b) => (
                  <li
                    key={b.id}
                    className={`p-2 rounded ${
                      b.status === "Pending"
                        ? "bg-yellow-50 border border-yellow-200"
                        : b.status === "Accepted"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">
                        {format(new Date(b.check_in), "MMM d")} -{" "}
                        {format(new Date(b.check_out), "MMM d, yyyy")}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          b.status === "Pending"
                            ? "text-yellow-600"
                            : b.status === "Accepted"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    {b.status === "Pending" && (
                      <p className="text-xs text-gray-500 mt-1">
                        ⏳ Waiting for owner approval
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------- Accepted Bookings (Busy Dates) ---------- */}
          <div className="mt-4 text-left border-t pt-3">
            <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={16} /> Unavailable Dates
            </h3>
            {acceptedBookings.length > 0 ? (
              <ul className="text-xs text-gray-500 space-y-1 max-h-20 overflow-y-auto">
                {acceptedBookings.map((b, i) => (
                  <li key={i}>
                    {format(new Date(b.check_in), "MMM d")} -{" "}
                    {format(new Date(b.check_out), "MMM d, yyyy")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">All dates available</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Description & Amenities ---------- */}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <p className="text-gray-700 leading-relaxed">
            {property.description || "No description provided by host."}
          </p>

          {property.amenities?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">What this place offers</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-gray-600 text-sm">
                {property.amenities.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Reviews Section ---------- */}
      <section className="mt-12 border-t pt-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="text-airbnb-red" /> Reviews
        </h2>

        <div className="space-y-4 mt-4">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user_name}</span>
                  <span className="text-sm text-gray-500">
                    {"★".repeat(r.rating)}
                  </span>
                </div>
                <p className="text-sm mt-1">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          )}
        </div>

        {/* ---------- Add Review ---------- */}
        {user && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Leave a review</h3>
            <select
              value={newReview.rating}
              onChange={(e) =>
                setNewReview({ ...newReview, rating: parseInt(e.target.value) })
              }
              className="border rounded px-2 py-1 mr-2"
            >
              {[5, 4, 3, 2, 1].map((v) => (
                <option key={v} value={v}>
                  {v} stars
                </option>
              ))}
            </select>
            <textarea
              placeholder="Share your experience..."
              className="border rounded w-full p-2 mt-2"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
            />
            <button
              onClick={async () => {
                try {
                  if (!user) return toast.error("Please log in first");
                  await api.post("/reviews", {
                    property_id: property.id,
                    user_id: user.id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                  });
                  toast.success("Review added!");
                  const { data } = await api.get(`/reviews/${property.id}`);
                  setReviews(data.reviews);
                  setNewReview({ rating: 5, comment: "" });
                } catch {
                  toast.error("Failed to add review");
                }
              }}
              className="mt-2 bg-airbnb-red text-white px-4 py-2 rounded-full hover:bg-[#E31C5F]"
            >
              Submit
            </button>
          </div>
        )}
      </section>
    </div>
  );
}