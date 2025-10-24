import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

export default function PropertyCard({ p }) {
  let cover = "https://placehold.co/600x400";
  try {
    const imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    if (imgs?.length) cover = `http://localhost:4000${imgs[0]}`;
  } catch {}

  return (
    <Link to={`/property/${p.id}`} className="rounded-xl overflow-hidden border hover:shadow transition bg-white relative">
      <img src={cover} alt={p.title} className="h-48 w-full object-cover" />
      <FavoriteButton propertyId={p.id} className="absolute top-2 right-2 text-white drop-shadow" />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold line-clamp-1">{p.title}</h3>
          <div className="font-semibold">${p.price_per_night}</div>
        </div>
        <div className="text-sm text-gray-600">{p.location}</div>
      </div>
    </Link>
  );
}
