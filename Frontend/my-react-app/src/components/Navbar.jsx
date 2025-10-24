import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  }

  const Item = ({ to, children }) => (
    <Link to={to} className={`px-3 py-1 rounded ${pathname===to?"bg-gray-100":""}`}>{children}</Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-red-500 font-extrabold text-xl">Airbnb</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {user?.role === "owner" && <Item to="/post">Post</Item>}
          {user && <Item to="/bookings">Bookings</Item>}
          {user && <Item to="/favorites">Favorites</Item>}
          {user && <Item to="/profile">Profile</Item>}
          {!user && <Item to="/login">Login</Item>}
        </div>

        <div className="relative">
          <button
            onClick={()=>setOpen(o=>!o)}
            className="border rounded-full px-3 py-1 hover:shadow flex items-center gap-2"
          >
            <span className="text-sm">{user ? user.name : "Menu"}</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-48">
              {!user && <Link className="block px-3 py-2 hover:bg-gray-50" to="/signup">Sign up</Link>}
              {!user && <Link className="block px-3 py-2 hover:bg-gray-50" to="/login">Log in</Link>}
              {user?.role==="owner" && <Link className="block px-3 py-2 hover:bg-gray-50" to="/owner">Owner dashboard</Link>}
              {user && <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-gray-50">Log out</button>}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
