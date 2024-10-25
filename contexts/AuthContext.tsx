"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserViewModel } from "@/models/UserViewModel";
import { fetchUserAttributes, getCurrentUser, signOut } from "aws-amplify/auth";

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
      const userAttributes = await fetchUserAttributes();
      setUser(
        new UserViewModel(
          userAttributes.sub!,
          userAttributes.preferred_username!,
          false,
        ),
      );
    } catch (err) {
      setUser(new UserViewModel("guest", "guest", true));
    }
  }

  async function logout() {
    try {
      await signOut();
      setUser(new UserViewModel("guest", "guest", true));
    } catch (error) {
      console.error("Error signing out:", error);
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
