import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function PropertyDetails() {
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

useEffect(() => {
  const id = window.location.pathname.split("/").pop();
  api.get(`/properties/${id}`).then((res) => {
    const p = res.data.property;
    try {
      p.images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    } catch {}
    setProperty(p);
  });
  api.get(`/reviews/${id}`).then((res) => setReviews(res.data.reviews));
}, []);

  async function submitReview() {
    try {
      const user = JSON.parse(localStorage.getItem("user")); // simple auth context
      if (!user) return toast.error("Login required");
      await api.post("/reviews", {
        property_id: property.id,
        user_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      toast.success("Review added!");
      setNewReview({ rating: 5, comment: "" });
      const { data } = await api.get(`/reviews/${property.id}`);
      setReviews(data.reviews);
    } catch {
      toast.error("Failed to post review");
    }
  }

  if (!property) return null;
  const stars = Array.from({ length: 5 });

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* existing property info above… */}

      <section className="mt-10 border-t pt-6">
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

        <div className="mt-6">
          <h3 className="font-medium mb-2">Leave a review</h3>
          <select
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: parseInt(e.target.value) })
            }
            className="border rounded px-2 py-1 mr-2"
          >
            {stars.map((_, i) => (
              <option key={i} value={5 - i}>
                {5 - i} stars
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
            onClick={submitReview}
            className="mt-2 bg-airbnb-red text-white px-4 py-2 rounded-full hover:bg-[#E31C5F]"
          >
            Submit
          </button>
        </div>
      </section>
    </div>
  );
}
