"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserViewModel } from "@/models/UserViewModel";
import { fetchUserAttributes, signOut, getCurrentUser } from "aws-amplify/auth";

interface AuthContextType {
  user: UserViewModel | null;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserViewModel | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser(
        new UserViewModel(
          currentUser.userId,
          currentUser.username!,
          attributes.preferred_username || "unknown",
          false,
        ),
      );
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(new UserViewModel("guest", "guest", "guest", true));
    }
  }

  async function logout() {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUser(new UserViewModel("guest", "guest", "guest", true));
    }
  }

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
