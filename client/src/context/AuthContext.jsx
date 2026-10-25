import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
const AuthContext = createContext(null);
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;
axios.defaults.timeout = 20000;
const clearStorage = () => {
  localStorage.removeItem("elocab_user");
  localStorage.removeItem("elocab_token");
  delete axios.defaults.headers.common.Authorization;
};
export const useAuth = () => useContext(AuthContext);
const savedAccount = () => {
  try {
    const token = localStorage.getItem("elocab_token");
    const account = JSON.parse(localStorage.getItem("elocab_user"));
    if (token && ["customer", "driver", "admin"].includes(account?.role)) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      return { ...account, token };
    }
  } catch {
    clearStorage();
  }
  return null;
};
export function AuthProvider({ children }) {
  const authVersion = useRef(0);
  const [user, setUser] = useState(savedAccount);
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("elocab_token") && !user,
  );
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const token = localStorage.getItem("elocab_token");
      const version = authVersion.current;
      const current = () =>
        mounted &&
        version === authVersion.current &&
        localStorage.getItem("elocab_token") === token;
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      try {
        const { data } = await axios.get("/api/auth/me");
        if (current()) setUser({ ...data, token });
      } catch (error) {
        if (!current()) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearStorage();
          setUser(null);
        }
        // A network outage must not silently sign the user out.
        else {
          try {
            const cached = JSON.parse(localStorage.getItem("elocab_user"));
            if (
              mounted &&
              ["customer", "driver", "admin"].includes(cached?.role)
            )
              setUser({ ...cached, token });
          } catch {
            clearStorage();
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    restore();
    const interceptor = axios.interceptors.response.use(
      (r) => r,
      (error) => {
        const activeHeader = `Bearer ${localStorage.getItem("elocab_token")}`;
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes("/login") &&
          mounted &&
          error.config?.headers?.Authorization === activeHeader
        ) {
          authVersion.current++;
          setUser(null);
          clearStorage();
        }
        return Promise.reject(error);
      },
    );
    const syncLogout = (event) => {
      if (event.key === "elocab_token" && !event.newValue) {
        setUser(null);
        delete axios.defaults.headers.common.Authorization;
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => {
      mounted = false;
      axios.interceptors.response.eject(interceptor);
      window.removeEventListener("storage", syncLogout);
    };
  }, []);
  const persist = (data) => {
    authVersion.current++;
    setUser(data);
    localStorage.setItem("elocab_user", JSON.stringify(data));
    localStorage.setItem("elocab_token", data.token);
    axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    return data;
  };
  const login = async (identifier, password, admin = false) => {
    const { data } = await axios.post(
      admin ? "/api/auth/admin/login" : "/api/auth/login",
      admin
        ? { email: identifier, password }
        : { phoneNumber: identifier, password },
    );
    return persist(data);
  };
  const register = async (values) => {
    const { data } = await axios.post("/api/auth/register", values);
    return persist(data);
  };
  const logout = () => {
    authVersion.current++;
    clearStorage();
    setUser(null);
  };
  const updateUser = (values) => {
    if (user) persist({ ...user, ...values });
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const homeFor = (role) =>
  ["customer", "driver", "admin"].includes(role) ? `/${role}/dashboard` : "/";
export const errorMessage = (error) =>
  error.response?.data?.message ||
  (error.code === "ECONNABORTED"
    ? "The request timed out. Please try again."
    : typeof error === "string"
      ? error
      : "Unable to connect. Check your connection and try again.");
