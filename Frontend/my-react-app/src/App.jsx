import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";
import OwnerDashboard from "./pages/OwnerDashboard";

// layout pieces
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";

// pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PropertyDetails from "./pages/PropertyDetails";
import PostProperty from "./pages/PostProperty";
import Bookings from "./pages/Bookings";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import MyTrips from "./pages/MyTrips.jsx";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import Wishlist from "./pages/Wishlist";
import OwnerBookings from "./pages/OwnerBookings.jsx";
import AIConcierge from "./components/AIConcierge";

/* ---------- Guarded route helper ---------- */
function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ---------- AI Concierge Wrapper (access auth context) ---------- */
function AIConciergeWrapper() {
  const { user } = useAuth();

  // Only show if user is logged in and is a traveler
  if (!user || !user.id) return null;

  return <AIConcierge userId={user.id} />;
}

/* ---------- Main Application ---------- */
export default function App() {
  return (
    <AuthProvider>

      <Header />
      {/*<CategoryBar />*/}

      {/* Main page content area */}
      <main className="max-w-6xl mx-auto px-4 py-6 min-h-[70vh]">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes (login required) */}
          <Route path="/post" element={<Protected><PostProperty /></Protected>} />
          <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/my-trips" element={<Protected><MyTrips /></Protected>} />
          <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />

          {/* Owner routes - CLEANED UP */}
          <Route path="/owner" element={<Protected><OwnerDashboard /></Protected>} />
          <Route path="/owner-bookings" element={<Protected><OwnerBookings /></Protected>} />
          <Route path="/add-property" element={<Protected><AddProperty /></Protected>} />
          <Route path="/edit-property/:id" element={<Protected><EditProperty /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global footer */}
      <Footer />

      {/* 🤖 AI Travel Concierge - Available on all pages when logged in */}
      <AIConciergeWrapper />
    </AuthProvider>
  );
}