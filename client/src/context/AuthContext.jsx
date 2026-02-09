import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Configure axios base URL from environment variable
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("elocab_user");
    const storedToken = localStorage.getItem("elocab_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Set default axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? "/api/auth/admin/login" : "/api/auth/login";
      const { data } = await axios.post(endpoint, { email, password });

      setUser(data);
      localStorage.setItem("elocab_user", JSON.stringify(data));
      localStorage.setItem("elocab_token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post("/api/auth/register", userData);

      setUser(data);
      localStorage.setItem("elocab_user", JSON.stringify(data));
      localStorage.setItem("elocab_token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("elocab_user");
    localStorage.removeItem("elocab_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
