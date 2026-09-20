import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  loginWithEmail,
  signupWithEmail,
  loginAsGuest,
  logout as logoutService,
  updateUserPreferences
} from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const active = getCurrentUser();
    setUser(active);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const logged = await loginWithEmail(email, password);
    setUser(logged);
    setIsAuthModalOpen(false);
    return logged;
  };

  const signup = async (name, email, password) => {
    const created = await signupWithEmail(name, email, password);
    setUser(created);
    setIsAuthModalOpen(false);
    return created;
  };

  const continueAsGuest = async () => {
    const guest = await loginAsGuest();
    setUser(guest);
    setIsAuthModalOpen(false);
    return guest;
  };

  const logout = async () => {
    await logoutService();
    const guest = getCurrentUser();
    setUser(guest);
  };

  const updatePreferences = (prefs) => {
    const updated = updateUserPreferences(prefs);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        signup,
        continueAsGuest,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
