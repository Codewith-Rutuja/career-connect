import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  authStorage,
  fetchCurrentUser,
  getErrorMessage,
  loginUser,
  registerUser,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = authStorage.getToken();

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch {
        authStorage.clear();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      authStorage.setToken(response.token);
      setUser(response.user);
      toast.success(response.message || "Welcome back.");
      return response;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to log in.");
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (payload) => {
    try {
      const response = await registerUser(payload);
      authStorage.setToken(response.token);
      setUser(response.user);
      toast.success(response.message || "Account created successfully.");
      return response;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create account.");
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    toast.success("You have been signed out.");
  };

  const refreshUser = async () => {
    const response = await fetchCurrentUser();
    setUser(response.user);
    return response.user;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [authLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
