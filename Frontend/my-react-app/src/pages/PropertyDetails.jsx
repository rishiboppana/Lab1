import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/properties/${id}`);
        const p = res.data.property;

        // Parse image JSON safely
        try {
          p.images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch {}
        setProperty(p);

        const rev = await api.get(`/reviews/${id}`);
        setReviews(rev.data.reviews);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load property");
      }
    }
    fetchData();
  }, [id]);

  if (!property)
    return (
      <div className="text-center py-10 text-airbnb-gray">Loading property...</div>
    );

  const avg = property.avg_rating || "–";
  const count = property.review_count || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      {/* ---------- Top Image Grid ---------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
        {property.images?.slice(0, 5).map((img, i) => (
          <img
            key={i}
            src={img.startsWith("http") ? img : `http://localhost:4000${img}`}
            alt={property.title}
            onError={(e) => (e.target.src = "https://placehold.co/600x400")}
            className={`object-cover w-full h-64 ${
              i === 0 ? "md:col-span-2 lg:col-span-2 h-96" : ""
            }`}
          />
        ))}
      </div>

      {/* ---------- Header Info ---------- */}
      <div className="flex justify-between items-start mt-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Star size={14} className="text-airbnb-red mr-1" />
            <span className="font-medium">{avg}</span>
            <span className="mx-1">•</span>
            <span>{count} reviews</span>
            <span className="mx-1">•</span>
            <span>{property.location}</span>
          </div>
        </div>

        <div className="border rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xl font-semibold text-airbnb-dark">
            ${property.price_per_night}
            <span className="text-sm text-gray-500"> / night</span>
          </p>
          <button className="mt-3 w-full bg-airbnb-red text-white rounded-full py-2 hover:bg-[#E31C5F] transition">
            Reserve
          </button>
        </div>
      </div>

      {/* ---------- Description & Amenities ---------- */}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <p className="text-gray-700 leading-relaxed">{property.description}</p>

          {property.amenities && (
  <div className="mt-6">
    <h3 className="font-semibold mb-2">What this place offers</h3>
    <ul className="grid sm:grid-cols-2 gap-2 text-gray-600 text-sm">
      {(() => {
        let list = [];

        if (Array.isArray(property.amenities)) {
          // ✅ already an array
          list = property.amenities;
        } else if (typeof property.amenities === "string") {
          try {
            // try parsing JSON first
            const parsed = JSON.parse(property.amenities);
            list = Array.isArray(parsed)
              ? parsed
              : property.amenities.split(",").map((a) => a.trim());
          } catch {
            // fallback: comma-separated
            list = property.amenities.split(",").map((a) => a.trim());
          }
        }

        return list.map((a, i) => <li key={i}>• {a}</li>);
      })()}
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
          {reviews.map((r) => (
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
          ))}
          {reviews.length === 0 && (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          )}
        </div>

        {/* ---------- Add Review ---------- */}
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
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user) return toast.error("Login required");
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
      </section>
    </div>
  );
}
