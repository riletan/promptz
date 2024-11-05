import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import type { Metadata, Viewport } from "next";
import "@cloudscape-design/global-styles/index.css";
import "./globals.css";
import TopNav from "@/components/TopNav";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "PROMPTZ - Discover, Create, and Share Prompts for Amazon Q Developer",
  description:
    "Simplify prompt engineering for Amazon Q Developer with the ultimate prompt library for Amazon Q Developer. Discover, create, and perfect prompts for Amazon Q Developer. Explore a rich library of categorized prompts, share your own, and collaborate with the community to enhance your software development lifecycle. ",
  keywords:
    "promptz, prompt, prompt engineering, Amazon Q Developer, prompt library, promptz.dev, software development lifecycle, SDLC prompts, developer tools, prompt sharing, collaborative platform, software prompts, development best practices, prompt creation, coding prompts, deployment prompts, community-driven development, cloud development tools, generative AI prompts",
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://promptz.dev",
    title:
      "PROMPTZ - Discover, Create, and Share Prompts for Amazon Q Developer",
    description:
      "Explore a rich library of prompts for Amazon Q Developer, share your own, and collaborate with the community.",
    siteName: "PROMPTZ",
    images: [
      {
        url: "https://promptz.dev/images/og-image.png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConfigureAmplifyClientSide />
        <AuthProvider>
          <TopNav />
          <Suspense>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
