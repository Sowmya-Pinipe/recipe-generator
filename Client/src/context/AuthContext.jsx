import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

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
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "/api/auth";

  // Check if user is logged in on mount
  const checkAuth = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
  }, [token]);

  const register = useCallback(async (name, email, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/register`, {
        name,
        email,
        password,
        passwordConfirm,
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.error || "Registration failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.error || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("authToken");
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
