import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // optional: fetch session user from backend on mount
  useEffect(() => {
    api.get("/auth/me", { withCredentials: true })
      .then(res => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {});
  }, []);

  // persist on change
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <AuthCtx.Provider value={{ user, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}
