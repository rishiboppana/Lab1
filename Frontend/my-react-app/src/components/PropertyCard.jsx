import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
// import { Star } from "lucide-react";  // optional icon (lucide is preinstalled in Vite template)

export default function PropertyCard({ p }) {
  let imgs = [];
  try {
    imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
  } catch {}
  const cover =
    imgs && imgs.length ? `http://localhost:4000${imgs[0]}` : "https://placehold.co/800x600";

  return (
    <div className="group relative">
      {/* Image */}
      <Link to={`/property/${p.id}`} className="block overflow-hidden rounded-2xl">
        <img
          src={cover}
          alt={p.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Top-left badge */}
        <span className="absolute top-3 left-3 bg-white/90 text-[11px] font-medium px-2 py-[2px] rounded-full shadow">
          Guest favorite
        </span>
        {/* Heart icon */}
        <FavoriteButton
          propertyId={p.id}
          className="absolute top-3 right-3 text-white text-2xl drop-shadow-lg hover:scale-110 transition"
        />
      </Link>

      {/* Details */}
      <div className="mt-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm text-airbnb-dark line-clamp-1">
            {p.title}
          </h3>
          <div className="flex items-center text-xs text-gray-600">
            <Star size={12} className="text-airbnb-red mr-[2px]" />
            4.9
          </div>
        </div>
        <p className="text-[13px] text-airbnb-gray">{p.location}</p>
        <p className="text-[13px] mt-1">
          <span className="font-semibold">${p.price_per_night}</span>{" "}
          <span className="text-gray-500">night</span>
        </p>
      </div>
    </div>
  );
}
