import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogin(e) {
  e.preventDefault();
  try {
    const { data } = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/");
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.error || "Invalid credentials");
  }
}

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl animate-fadeIn"
      >
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-airbnb-red text-white w-full py-2 rounded-lg hover:bg-[#E31C5F]">
          Continue
        </button>
        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-airbnb-red font-medium">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
