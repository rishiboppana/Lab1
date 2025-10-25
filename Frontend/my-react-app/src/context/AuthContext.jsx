import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 On mount: always check backend session
  useEffect(() => {
    async function loadSession() {
      try {
        const { data } = await api.get("/auth/me", { withCredentials: true });
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.warn("Session check failed:", err.message);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // 🔹 Keep localStorage in sync
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // 🟢 Render only after session check completes
  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Checking session...
      </div>
    );

  return (
    <AuthCtx.Provider value={{ user, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}
