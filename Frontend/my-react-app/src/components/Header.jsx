import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Menu, User } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  async function logout() {
    await fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  }

  async function handleBecomeHost() {
    try {
      const { data } = await api.post("/auth/become-host", {}, { withCredentials: true });
      setUser(data.user);
      toast.success("You are now a host!");
      navigate("/post");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to become host");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-airbnb-red font-extrabold text-xl sm:text-2xl">airbnb</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && user.role !== "owner" && (
            <button
              onClick={handleBecomeHost}
              className="text-xs sm:text-sm font-semibold hover:bg-gray-50 rounded-full px-3 sm:px-4 py-2 transition"
            >
              Become a Host
            </button>
          )}

          {user && user.role === "owner" && (
            <Link
              to="/add-property"
              className="text-xs sm:text-sm font-semibold hover:bg-gray-50 rounded-full px-3 sm:px-4 py-2 transition"
            >
              Airbnb your home
            </Link>
          )}

          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 border rounded-full px-2 sm:px-3 py-1.5 hover:shadow-md transition"
            >
              <Menu size={16} />
              <User size={18} className="text-gray-500" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg w-56 overflow-hidden"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}
              >
                {!user && (
                  <>
                    <Link className="block px-4 py-3 hover:bg-gray-50" to="/signup">
                      Sign up
                    </Link>
                    <Link className="block px-4 py-3 hover:bg-gray-50" to="/login">
                      Log in
                    </Link>
                  </>
                )}

                {user?.role === "owner" && (
                  <>
                    <Link to="/add-property" className="block px-4 py-3 hover:bg-gray-50 font-medium">
                      Add Property
                    </Link>
                    <Link to="/owner" className="block px-4 py-3 hover:bg-gray-50 font-medium">
                      Owner Dashboard
                    </Link>
                    <hr className="my-2" />
                  </>
                )}

                {user && (
                  <>
                    <Link className="block px-4 py-3 hover:bg-gray-50" to="/profile">
                      Profile
                    </Link>
                    <Link to="/my-trips" className="block px-4 py-3 hover:bg-gray-50">
                      My Trips
                    </Link>
                    <Link to="/favorites" className="block px-4 py-3 hover:bg-gray-50">
                      Favorites
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}