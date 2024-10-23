// components/TopNav.tsx

"use client";

import { TopNavigation } from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <TopNavigation
      identity={{
        href: "/",
        title: "Promptz",
        logo: {
          src: "/images/amazon-q.png",
          alt: "Amazon Q Developer Logo",
        },
      }}
      utilities={[
        {
          type: "button",
          text: "Browse",
          href: "/browse",
        },
        user && !user.guest
          ? {
              type: "button",
              text: "Sign Out",
              onClick: async () => {
                await logout();
                router.push("/");
              },
            }
          : {
              type: "button",
              text: "Sign In",
              ariaLabel: "Sign in",
              href: "/auth",
            },
      ]}
    />
  );
}
