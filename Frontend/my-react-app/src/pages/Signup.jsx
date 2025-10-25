import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ role: "traveler", name: "", email: "", password: "" });
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/signup", form);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={handleSignup}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl animate-fadeIn"
      >
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <select
          className="border p-2 w-full rounded-lg"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="traveler">Traveler</option>
          <option value="owner">Owner</option>
        </select>
        <input
          className="border p-2 w-full rounded-lg"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full rounded-lg"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full rounded-lg"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="bg-airbnb-red text-white w-full py-2 rounded-lg hover:bg-[#E31C5F]">
          Sign up
        </button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-airbnb-red font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}
