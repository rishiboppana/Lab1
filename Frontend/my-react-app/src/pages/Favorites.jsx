import { api } from "../api/axios";
import { useState, useEffect } from "react";
import { Star, MapPin, DollarSign, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Favorites() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch favorites when component mounts and on focus
  useEffect(() => {
    fetchFavorites();

    // Refresh favorites when user comes back to this page
    const handleFocus = () => {
      fetchFavorites();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const res = await api.get("/favorites");
      console.log("Favorites response:", res.data);
      setList(res.data.favorites || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(propertyId, e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.post("/favorites/toggle", { property_id: propertyId });
      // Immediately remove from UI
      setList(prev => prev.filter(p => p.property_id !== propertyId));
      toast.success("Removed from wishlist ❌");
      
      // Refresh the list to sync with backend
      setTimeout(() => {
        fetchFavorites();
      }, 500);
    } catch (err) {
      console.error("Error removing favorite:", err);
      toast.error("Failed to remove from wishlist");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Favourites</h1>
          <p className="text-gray-600 mt-2">Properties you've saved ({list.length})</p>
        </div>

        {/* Favorites Grid */}
        {list.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 mb-6 text-lg">No favorites yet</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.map((fav) => {
              // Handle both data structures
              const p = fav.property || fav;
              const propertyId = fav.property_id || p.id;
              
              console.log("Fav item:", fav);
              console.log("Property data:", p);
              
              // Parse images
              let imgUrl = "https://placehold.co/400x300";
              try {
                const imgs = typeof p.images === "string" 
                  ? JSON.parse(p.images) 
                  : p.images;
                if (Array.isArray(imgs) && imgs.length > 0) {
                  imgUrl = imgs[0].startsWith("http") 
                    ? imgs[0] 
                    : `http://localhost:4000${imgs[0]}`;
                }
              } catch (err) {
                console.error("Error parsing images:", err);
              }

              return (
                <div 
                  key={fav.id || p.id} 
                  onClick={() => navigate(`/property/${propertyId}`)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer group"
                >
                  
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={p.title}
                      onError={(e) => (e.target.src = "https://placehold.co/400x300")}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin size={16} />
                        <p className="text-sm">{p.location}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {p.avg_rating ? parseFloat(p.avg_rating).toFixed(1) : "–"}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({p.review_count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className="text-gray-600" />
                      <span className="text-lg font-bold text-gray-900">
                        {p.price_per_night}
                      </span>
                      <span className="text-gray-600">/ night</span>
                    </div>

                    {/* Details */}
                    <div className="flex gap-3 text-sm text-gray-600 pt-2 border-t border-gray-200">
                      <span>{p.bedrooms} beds</span>
                      <span>•</span>
                      <span>{p.bathrooms} baths</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/property/${propertyId}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition font-semibold text-sm"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={(e) => removeFavorite(propertyId, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition font-semibold text-sm"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
