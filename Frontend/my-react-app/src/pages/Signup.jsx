import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({
    role: "traveler",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      setUser(data.user);
      toast.success("Account created successfully! 🎉");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-2">Join Airbnb and start your journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              I'm joining as a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Traveler Option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "traveler" })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  form.role === "traveler"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User size={24} className={form.role === "traveler" ? "text-red-500" : "text-gray-400"} />
                <span className="text-xs font-semibold mt-2 text-gray-900">Traveler</span>
              </button>

              {/* Host Option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "owner" })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  form.role === "owner"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Home size={24} className={form.role === "owner" ? "text-red-500" : "text-gray-400"} />
                <span className="text-xs font-semibold mt-2 text-gray-900">Host</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="password"
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters</p>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-1 rounded border-gray-300 text-red-500 cursor-pointer"
              required
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
              I agree to Airbnb's{" "}
              <button type="button" className="text-gray-700 hover:underline font-semibold">Terms</button>,{" "}
              <button type="button" className="text-gray-700 hover:underline font-semibold">Privacy Policy</button>, and{" "}
              <button type="button" className="text-gray-700 hover:underline font-semibold">Cookie Policy</button>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:text-red-600 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
