import { createContext, useState, useEffect } from "react";
import { useContext } from "react";
import axiosClient from "../API/axiosClient";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const publicRoutes = [
      "/verify-email",
      "/reset-password",
      "/login",
      "/register",
    ];

    // Check if current route starts with any of the public ones
    const isPublic = publicRoutes.some((route) =>
      location.pathname.startsWith(route)
    );
    if (isPublic) return; // Skip token verification
    else if (!initialized) {
      initializeAuth();
    }
  }, [location.pathname, initialized]);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Verify token (cookies sent automatically)
      const response = await axiosClient.get("/api/auth/verify");

      console.log("/api/auth/verify (response): ", response);
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Not authenticated or token expired
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (credentials, userType) => {
    try {
      const endpoints = {
        admin: "/api/auth/admin/login",
        institution: "/api/auth/institution/login",
        student: "/api/auth/student/login",
      };

      const response = await axiosClient.post(endpoints[userType], credentials);

      if (response.data.success) {
        const { user } = response.data.data;

        // Cookies are set automatically by backend
        setUser(user);
        setIsAuthenticated(true);

        return { success: true, user };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login failed:", error);
      // return {
      //   success: false,
      //   message: error.response?.data?.message || "Login failed",
      // };
      throw error;
      
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
