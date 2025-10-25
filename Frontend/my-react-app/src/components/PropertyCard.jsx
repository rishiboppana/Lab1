import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { Star } from "lucide-react";

export default function PropertyCard({ p }) {
    let imgs = [];
    try {
      imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    } catch {}

    let cover = imgs?.[0] || "";
    if (cover && !cover.startsWith("http")) {
      cover = `http://localhost:4000${cover}`;
    }

    const handleImgError = (e) => {
      e.target.src = "https://placehold.co/600x400?text=No+Image";
    };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      className="group relative cursor-pointer"
    >
      <Link to={`/property/${p.id}`} className="block overflow-hidden rounded-2xl bg-airbnb-light">
        <img
          src={cover}
          alt={p.title}
          onError={handleImgError}
          className="aspect-[4/3] w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
        />
        <FavoriteButton propertyId={p.id}
                        className="absolute top-3 right-3 text-white text-2xl drop-shadow-lg hover:scale-110 transition" />
      </Link>

      <div className="mt-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm text-airbnb-dark line-clamp-1">{p.title}</h3>
        <div className="flex items-center text-xs text-gray-600">
          <Star size={12} className="text-airbnb-red mr-[2px]" />
          {p.avg_rating ? Number(p.avg_rating).toFixed(1) : "–"}
          <span className="ml-1 text-gray-400">
            ({p.review_count || 0})
          </span>
        </div>
        </div>
        <p className="text-[13px] text-airbnb-gray">{p.location}</p>
        <p className="text-[13px] mt-1">
          <span className="font-semibold">${p.price_per_night}</span>
          <span className="text-gray-500"> night</span>
        </p>
      </div>
    </motion.div>
  );
}
