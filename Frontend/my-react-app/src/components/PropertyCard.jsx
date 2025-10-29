import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { Star, MapPin } from "lucide-react";

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
    e.target.src = "https://placehold.co/300x300?text=No+Image";
  };

  const rating = p.avg_rating ? Number(p.avg_rating).toFixed(2) : null;
  const reviewCount = p.review_count || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative cursor-pointer"
    >
      <Link
        to={`/property/${p.id}`}
        className="block relative overflow-hidden rounded-2xl bg-gray-100"
      >
        {/* Image Container - Standard Fixed Size */}
        <div className="relative w-full pt-[100%] overflow-hidden rounded-2xl">
          <img
            src={cover || "https://placehold.co/300x300?text=No+Image"}
            alt={p.title}
            onError={handleImgError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Image Counter Badge */}
          {imgs?.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full shadow-md text-xs font-semibold text-gray-900">
              1 / {imgs.length}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton propertyId={p.id} />
        </div>
      </Link>

      {/* Property Details - Fixed Layout */}
      <div className="pt-3 space-y-1.5">
        
        {/* Title & Rating Row */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1">
            {p.title}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={14} className="fill-gray-900 text-gray-900" />
              <span className="text-sm font-semibold text-gray-900">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600 line-clamp-1">
          {p.location}
        </p>

        {/* Review Count */}
        {rating && reviewCount > 0 && (
          <p className="text-sm text-gray-500">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </p>
        )}

        {/* Price */}
        <p className="text-sm font-semibold text-gray-900 pt-1">
          <span className="font-bold">${Number(p.price_per_night).toFixed(0)}</span>
          <span className="font-normal text-gray-600"> / night</span>
        </p>
      </div>
    </motion.div>
  );
}
