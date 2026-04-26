import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser  = localStorage.getItem("luckytech_user");
    const savedToken = localStorage.getItem("luckytech_token");
    if (savedUser && savedToken) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  const register = async (data) => {
    try {
      const res = await API.post("/auth/register", data);
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed.",
        alreadyRegistered: err.response?.data?.alreadyRegistered || false,
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", {email, password });
      const { token, student } = res.data;
      localStorage.setItem("luckytech_token", token);
      localStorage.setItem("luckytech_user",  JSON.stringify(student));
      setUser(student);
      return { success: true };
    } catch (err) {
      const code = err.response?.data?.code || err.response?.data?.message;
      if (code === "ACCOUNT_DISABLED") return { success: false, error: "Account disabled.", code: "ACCOUNT_DISABLED" };
      return { success: false, error: err.response?.data?.message || "Login failed." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("luckytech_token");
    localStorage.removeItem("luckytech_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
