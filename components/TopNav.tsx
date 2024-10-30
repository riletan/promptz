// components/TopNav.tsx

"use client";

import {
  TopNavigation,
  TopNavigationProps,
} from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const getUtilities = (): TopNavigationProps.Utility[] => {
    const utilities: TopNavigationProps.Utility[] = [
      {
        type: "button",
        text: "Browse",
        href: "/browse",
      },
    ];

    if (user && !user.guest) {
      utilities.push(
        {
          type: "button",
          text: "My Prompts",
          href: "/browse/my",
        },
        {
          type: "button",
          text: "Sign Out",
          onClick: async () => {
            await logout();
            router.push("/");
          },
        },
      );
    } else {
      utilities.push({
        type: "button",
        text: "Sign In",
        href: "/auth",
      });
    }

    return utilities;
  };

  return (
    <TopNavigation
      i18nStrings={{ overflowMenuTriggerText: "More" }}
      identity={{
        href: "/",
        title: "Promptz",
        logo: {
          src: "/images/amazon-q.png",
          alt: "Amazon Q Developer Logo",
        },
      }}
      utilities={getUtilities()}
    />
  );
}
