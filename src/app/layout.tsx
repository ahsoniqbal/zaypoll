// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "Zaypoll — Discuss every vote",
    template: "%s | Zaypoll",
  },
  description: "Explore public polls, compare opinions, and discuss the reasons behind every vote.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body>
        {children}

        {/* Global providers only */}
        <Suspense fallback={null}>
          <AuthModalProvider />
        </Suspense>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
