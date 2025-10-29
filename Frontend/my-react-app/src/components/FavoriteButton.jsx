import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useState, useEffect } from "react";

export default function FavoriteButton({ propertyId, className = "" }) {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load favorite status on mount and when page becomes visible
  useEffect(() => {
    checkFavoriteStatus();

    // Refresh when page gains focus (user comes back from another page)
    const handleFocus = () => {
      checkFavoriteStatus();
    };

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkFavoriteStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [propertyId]);

  async function checkFavoriteStatus() {
    try {
      const res = await api.get("/favorites");
      const favorites = res.data.favorites || [];
      const isFav = favorites.some(f => f.property_id === propertyId);
      console.log(`Property ${propertyId} is favorite: ${isFav}`);
      setIsActive(isFav);
    } catch (err) {
      console.log("Not logged in or error checking favorites");
      setIsActive(false);
    }
  }

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      await api.post("/favorites/toggle", { property_id: propertyId });
      const newState = !isActive;
      setIsActive(newState);
      toast.success(newState ? "Added to wishlist ❤️" : "Removed from wishlist ❌");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Please log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`absolute top-3 right-3 rounded-full p-2 shadow-md transition 
        ${isActive ? "bg-white text-[#FF385C]" : "bg-white text-gray-700 hover:text-[#FF385C]"} 
        ${loading ? "opacity-70" : "hover:scale-110"} 
        ${className}`}
    >
      <Heart
        size={22}
        fill={isActive ? "#FF385C" : "transparent"}
        stroke={isActive ? "#FF385C" : "#222"}
        strokeWidth={2}
      />
    </button>
  );
}