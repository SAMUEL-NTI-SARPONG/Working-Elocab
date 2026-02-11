import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Configure axios base URL from environment variable
// When VITE_API_URL is empty, requests use relative paths which Vercel proxy forwards to backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

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

  // Auto-logout on 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid — auto logout
          const currentUser = localStorage.getItem("elocab_user");
          if (currentUser) {
            setUser(null);
            localStorage.removeItem("elocab_user");
            localStorage.removeItem("elocab_token");
            delete axios.defaults.headers.common["Authorization"];
            toast.error("Session expired. Please log in again.");
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

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
