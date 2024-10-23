// components/Login.tsx
"use client";

import { withAuthenticator } from "@aws-amplify/ui-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { AuthUser } from "aws-amplify/auth";
import { useAuth } from "@/contexts/AuthContext";

function Login({ user }: { user?: AuthUser }) {
  const { fetchUser } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUser();
      redirect("/");
    }
  }, [user]);
  return null;
}

export default withAuthenticator(Login);
