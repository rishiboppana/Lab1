import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { Star } from "lucide-react";

export default function PropertyCard({ p }) {
  // Parse images properly
  let imgs = [];
  try {
    imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
  } catch {
    imgs = [];
  }

  // Get cover image
  let cover = imgs?.[0] || "";
  if (cover && !cover.startsWith("http")) {
    cover = `http://localhost:4000${cover}`;
  }

  const handleImgError = (e) => {
    e.target.src = "https://placehold.co/400x400?text=No+Image";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      className="group relative cursor-pointer flex-shrink-0 w-[240px]"
    >
      <Link
        to={`/property/${p.id}`}
        className="block relative overflow-hidden rounded-xl bg-gray-100"
      >
        {/* Favorite Button - Only ONE */}
        <FavoriteButton
          propertyId={p.id}
          className="absolute top-3 right-3 z-10 text-white text-2xl drop-shadow-lg hover:scale-110 transition"
        />

        {/* Property Image with fixed aspect ratio */}
        <div className="relative w-full  aspect-square overflow-hidden rounded-xl">
          <img
            src={cover || "https://placehold.co/400x400?text=No+Image"}
            alt={p.title}
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      {/* Property Details */}
      <div className="mt-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-[15px] text-gray-900 line-clamp-1 flex-1">
            {p.title}
          </h3>
          <div className="flex items-center text-xs flex-shrink-0">
            <Star size={12} className="fill-black text-black mr-1" />
            <span className="font-medium">
              {p.avg_rating ? Number(p.avg_rating).toFixed(2) : "New"}
            </span>
          </div>
        </div>

        <p className="text-[14px] text-gray-600 mt-0.5 line-clamp-1">{p.location}</p>

        <p className="text-[14px] mt-0.5 text-gray-600">
          <span className="font-normal">${Number(p.price_per_night).toFixed(0)}</span>
          <span className="text-gray-600 font-normal"> night</span>
        </p>
      </div>
    </motion.div>
  );
}