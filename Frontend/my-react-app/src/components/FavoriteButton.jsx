import { api } from "../api/axios";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function FavoriteButton({ propertyId, className = "" }) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load initial favorite state
  useEffect(() => {
    async function fetchFavoriteStatus() {
      try {
        const res = await api.get("/favorites");
        const favorites = res.data.favorites || [];
        const isFavorited = favorites.some((f) => f.property_id === propertyId);
        setActive(isFavorited);
      } catch {
        // Ignore if not logged in
      }
    }
    fetchFavoriteStatus();
  }, [propertyId]);

  // ✅ Toggle favorite on click
  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      await api.post("/favorites/toggle", { property_id: propertyId });
      const newState = !active;
      setActive(newState);
      toast.success(
        newState ? "Added to wishlist ❤️" : "Removed from wishlist ❌"
      );
    } catch {
      toast.error("Please log in to use wishlist");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Airbnb-style floating heart button
  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`absolute top-3 right-3 rounded-full p-2 shadow-md transition 
        ${active ? "bg-white text-[#FF385C]" : "bg-white text-gray-700 hover:text-[#FF385C]"} 
        ${loading ? "opacity-70 cursor-wait" : "hover:scale-110"} 
        ${className}`}
    >
      <Heart
        size={22}
        fill={active ? "#FF385C" : "transparent"}
        stroke={active ? "#FF385C" : "#222"}
        strokeWidth={2}
      />
    </button>
  );
}
