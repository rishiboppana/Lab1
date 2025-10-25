import { api } from "../api/axios";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function FavoriteButton({ propertyId, className = "" }) {
  const [active, setActive] = useState(false);

  async function toggle() {
    try {
      await api.post("/favorites/toggle", { property_id: propertyId });
      setActive(!active);
      toast.success(active ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Login required");
    }
  }

  return (
    <button onClick={toggle}
            className={`transition ${className}`}
            title="Toggle favorite">
      <Heart fill={active ? "#FF385C" : "transparent"} stroke="white" size={24} />
    </button>
  );
}
