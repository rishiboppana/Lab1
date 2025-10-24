import { api } from "../api/axios";
export default function FavoriteButton({ propertyId, className="" }) {
  async function toggle() {
    try {
      await api.post("/favorites/toggle", { property_id: propertyId });
    } catch {}
  }
  return (
    <button
      onClick={toggle}
      className={`text-xl leading-none hover:scale-110 transition ${className}`}
      title="Toggle favorite"
    >
      ♥
    </button>
  );
}
