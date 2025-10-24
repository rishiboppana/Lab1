import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-red-500">Airbnb</Link>
      <div className="flex gap-4">
        {user?.role === "owner" && <Link to="/post">Post Property</Link>}
        {user && <Link to="/bookings">Bookings</Link>}
        {user && <Link to="/favorites">Favorites</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {!user && <Link to="/login">Login</Link>}
        {user && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded-md"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
