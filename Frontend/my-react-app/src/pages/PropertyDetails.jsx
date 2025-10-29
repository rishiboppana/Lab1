import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { Star, MapPin, BedDouble, Bath, Users, ChevronLeft, ChevronRight, Home } from "lucide-react";
import toast from "react-hot-toast";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./PropertyDetails.css";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const { user } = useAuth();
  const [imageIndex, setImageIndex] = useState(0);
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), key: "selection" },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/properties/${id}`);
        const p = res.data.property;
        const allBookings = res.data.bookings || [];

        try {
          p.images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch {
          p.images = [];
        }

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
        const accepted = allBookings.filter(b => b.status === "Accepted");
        setAcceptedBookings(accepted);

        const rev = await api.get(`/reviews/${id}`);
        setReviews(rev.data.reviews || []);
      } catch (err) {
        console.error("Error loading property:", err);
        toast.error("Failed to load property details");
      }
    }

    fetchData();
  }, [id]);

  if (!property)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );

  const nights = Math.ceil((range[0].endDate - range[0].startDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = parseFloat(property?.price_per_night) || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.12;
  const total = subtotal + serviceFee;

  const avg = property.avg_rating ?? "–";
  const count = property.review_count ?? 0;

  const isDateBlocked = () => {
    const { startDate, endDate } = range[0];
    return acceptedBookings.some((booking) => {
      const bookingStart = new Date(booking.check_in);
      const bookingEnd = new Date(booking.check_out);
      return (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      );
    });
  };

  async function handleReserve() {
    try {
      if (!user) {
        toast.error("Please log in first");
        return;
      }
      if (isDateBlocked()) {
        toast.error("These dates are already booked");
        return;
      }

      const check_in = format(range[0].startDate, "yyyy-MM-dd");
      const check_out = format(range[0].endDate, "yyyy-MM-dd");

      await api.post("/bookings", {
        property_id: property.id,
        user_id: user.id,
        check_in,
        check_out,
      });

      toast.success("Booking request sent!");
      setRange([
        { startDate: new Date(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), key: "selection" },
      ]);
    } catch (err) {
      toast.error("Failed to create booking");
    }
  }

  const disabledDates = acceptedBookings.flatMap((booking) => {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    const dates = [];
    let current = new Date(start);
    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleNextImage = () => {
    setImageIndex((prev) => (prev + 1) % property.images.length);
  };

  return (
    <div className="w-full bg-white">
      {/* Image Gallery */}
      <div className="relative bg-gray-100 h-64 sm:h-80 lg:h-[500px]">
        {property.images?.length > 0 ? (
          <>
            <img
              src={
                property.images[imageIndex].startsWith("http")
                  ? property.images[imageIndex]
                  : `http://localhost:4000${property.images[imageIndex]}`
              }
              alt={property.title}
              onError={(e) => (e.target.src = "https://placehold.co/1200x600")}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Controls */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-gray-900" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-gray-900" />
                </button>
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-gray-900 shadow-lg">
                  {imageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src="https://placehold.co/1200x600?text=No+Image"
            alt="placeholder"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="w-full overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 overflow-hidden">
            
            {/* Header */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{property.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-gray-900 text-gray-900" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{avg}</span>
                  <span className="text-xs sm:text-sm">({count} reviews)</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <MapPin size={14} />
                  {property.location}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 py-3 sm:py-4 border-y border-gray-200">
                <div className="flex items-center gap-2">
                  <Home size={16} />
                  {property.type || "Property"}
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble size={16} />
                  {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={16} />
                  {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  Up to 8 guests
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">About this place</h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {property.description || "No description provided by host."}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What this place offers</h2>
                <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
                  {property.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4 sm:space-y-6 py-6 sm:py-8 border-t border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews</h2>
              
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{r.user_name}</span>
                        <span className="text-xs text-gray-600">
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2">{r.comment}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-2">No reviews yet. Be the first to review!</p>
                )}
              </div>

              {/* Add Review */}
              {user && (
                <div className="p-3 sm:p-6 bg-gray-50 rounded-lg space-y-3 sm:space-y-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Share your experience</h3>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>{v} stars</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Tell others what you think..."
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                  <button
                    onClick={async () => {
                      try {
                        if (!user) return toast.error("Please log in");
                        if (!newReview.comment.trim()) return toast.error("Please write a review");
                        
                        await api.post("/reviews", {
                          property_id: property.id,
                          user_id: user.id,
                          rating: newReview.rating,
                          comment: newReview.comment,
                        });
                        toast.success("Review added!");
                        const { data } = await api.get(`/reviews/${property.id}`);
                        setReviews(data.reviews || []);
                        setNewReview({ rating: 5, comment: "" });
                      } catch (err) {
                        toast.error("Failed to add review");
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-3 text-sm rounded-lg transition"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1 w-full overflow-hidden">
            <div className="sticky top-20 sm:top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 w-full">
              
              {/* Price */}
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${pricePerNight.toFixed(0)}
                  <span className="text-base sm:text-lg font-normal text-gray-600"> / night</span>
                </div>
              </div>

              {/* Date Picker */}
              <div className="rdr-calendar-wrapper">
                <DateRange
                  editableDateInputs={false}
                  onChange={(item) => setRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                  rangeColors={["#FF385C"]}
                  minDate={new Date()}
                  disabledDates={disabledDates}
                  direction="vertical"
                />
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown space-y-2 py-3 sm:py-4 border-y border-gray-200">
                <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                  <span>${pricePerNight.toFixed(0)} × {nights} night{nights !== 1 ? "s" : ""}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                  <span>Service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-900 text-sm sm:text-base">Total</span>
                <span className="text-gray-900 text-lg sm:text-xl">${total.toFixed(2)}</span>
              </div>

              {/* Reserve Button */}
              <button
                onClick={handleReserve}
                disabled={isDateBlocked()}
                className={`w-full py-2.5 sm:py-3 rounded-lg font-bold text-white text-sm sm:text-base transition ${
                  isDateBlocked()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isDateBlocked() ? "Dates Not Available" : "Reserve"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}