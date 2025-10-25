import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onClick = (e)=>{ if(ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  },[]);

  async function logout() {
    await fetch("http://localhost:4000/api/auth/logout", { method:"POST", credentials:"include" });
    setUser(null);
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-red-500 font-extrabold text-2xl">Airbnb</div>
          </Link>
          <SearchPill />
          <div className="relative" ref={ref}>
            <button
              onClick={()=>setMenuOpen(v=>!v)}
              className="flex items-center gap-3 border rounded-full px-3 py-2 hover:shadow"
              style={{boxShadow: "var(--air-shadow)"}}
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 grid place-items-center">👤</div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl overflow-hidden" style={{boxShadow:"var(--air-shadow)"}}>
                {!user && <Link className="block px-4 py-3 hover:bg-gray-50" to="/signup">Sign up</Link>}
                {!user && <Link className="block px-4 py-3 hover:bg-gray-50" to="/login">Log in</Link>}
                {user?.role==="owner" && <Link className="block px-4 py-3 hover:bg-gray-50" to="/owner">Owner dashboard</Link>}
                {user && <Link className="block px-4 py-3 hover:bg-gray-50" to="/profile">Profile</Link>}
                {user && <button onClick={logout} className="w-full text-left px-4 py-3 hover:bg-gray-50">Log out</button>}
              </div>
            )}
          </div>
        </div>
      </div>
      <CategoryBar />
    </header>
  );
}

function SearchPill() {
  return (
    <button
      className="hidden md:flex items-center rounded-full border bg-white px-3 py-2 hover:shadow transition"
      style={{boxShadow:"var(--air-shadow)"}}
    >
      <span className="px-3 text-sm font-medium border-r">Where</span>
      <span className="px-3 text-sm font-medium border-r">Any week</span>
      <span className="px-3 text-sm text-gray-500">Add guests</span>
      <span className="ml-2 w-8 h-8 rounded-full bg-red-500 grid place-items-center text-white">🔍</span>
    </button>
  );
}

function CategoryBar() {
  const cats = ["Icons", "Beach", "Amazing views", "Cabins", "Tiny homes", "Countryside", "Trending", "City", "National parks", "Camping", "Lakefront", "Pools"];
  return (
    <div className="border-t">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 overflow-auto no-scrollbar py-3">
          {cats.map(c=>(
            <button key={c} className="flex flex-col items-center text-xs text-gray-600 hover:text-black">
              <div className="w-6 h-6 rounded-full bg-gray-100 mb-1 grid place-items-center">🏷️</div>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
