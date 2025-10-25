// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Globe, Menu, User } from "lucide-react"; // icons

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-airbnb-red font-extrabold text-2xl">airbnb</span>
        </Link>

        <SearchPill />

        <div className="flex items-center gap-4">
          <Link
            to="/post"
            className="hidden md:block text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full"
          >
            Become a host
          </Link>
          <button className="hidden md:grid place-items-center w-9 h-9 rounded-full hover:bg-gray-100">
            <Globe size={18} />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 border rounded-full px-3 py-1.5 hover:shadow-md transition"
            >
              <Menu size={16} />
              <User size={18} className="text-gray-500" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg w-56 overflow-hidden"
                style={{ boxShadow: "var(--air-shadow)" }}
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
                        <Link to="/add-property" className="block px-4 py-3 hover:bg-gray-50">
                          Add Property
                        </Link>
                          <Link to="/owner" className="block px-4 py-3 hover:bg-gray-50">
                            Owner Dashboard
                          </Link>
                      </>
                    )}
                {user && (
                  <>
                    <Link className="block px-4 py-3 hover:bg-gray-50" to="/profile">
                      Profile
                    </Link>
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


function SearchPill() {
  return (
    <button
      className="hidden md:flex items-center justify-between rounded-full border py-2 px-4 hover:shadow-md transition text-sm space-x-4 bg-white"
    >
      <span className="font-medium border-r pr-4 text-black">Where</span>
      <span className="text-gray-600 border-r pr-4">Check in</span>
      <span className="text-gray-600 border-r pr-4">Check out</span>
      <span className="text-gray-600">Who</span>
      <div className="ml-2 bg-airbnb-red text-white rounded-full w-8 h-8 grid place-items-center">
        🔍
      </div>
    </button>
  );
}

