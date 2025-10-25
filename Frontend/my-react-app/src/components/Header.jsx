import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
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
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-airbnb-red font-extrabold text-2xl">airbnb</span>
        </Link>

        {/* Center Search pill */}
        <button
          className="hidden md:flex items-center justify-between border rounded-full py-2 pl-4 pr-2 hover:shadow-md transition"
          style={{ boxShadow: "var(--air-shadow)" }}
        >
          <span className="text-sm font-medium border-r pr-4">Anywhere</span>
          <span className="text-sm font-medium border-r px-4">Any week</span>
          <span className="text-sm text-gray-500 px-4">Add guests</span>
          <div className="bg-airbnb-red text-white rounded-full w-8 h-8 grid place-items-center">🔍</div>
        </button>

        {/* Profile Menu */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenu(!menu)}
            className="flex items-center gap-3 border rounded-full px-3 py-1 hover:shadow-md transition"
          >
            <span className="text-sm font-medium text-airbnb-gray">
              {user ? user.name.split(" ")[0] : "Menu"}
            </span>
            <div className="bg-airbnb-gray text-white rounded-full w-6 h-6 grid place-items-center text-xs">
              👤
            </div>
          </button>

          {menu && (
            <div
              className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg overflow-hidden w-56"
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
                <Link className="block px-4 py-3 hover:bg-gray-50" to="/owner">
                  Owner dashboard
                </Link>
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
    </header>
  );
}
