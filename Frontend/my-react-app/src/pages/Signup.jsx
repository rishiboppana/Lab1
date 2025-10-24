import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    role: "traveler",
    name: "",
    email: "",
    password: "",
  });
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
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-red-500">Sign Up</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <select
          className="border p-2 w-full rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="traveler">Traveler</option>
          <option value="owner">Owner</option>
        </select>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600"
        >
          Sign Up
        </button>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
