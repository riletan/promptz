import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import type { Metadata, Viewport } from "next";
import "@cloudscape-design/global-styles/index.css";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Promptz",
  description: "The ultimate prompting hub for Amazon Q Developer",
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
        <TopNav />
        {children}
      </body>
    </html>
  );
}
