// app/layout.tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { cn } from "@/lib/utils";


const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Polling App",
  description: "Polling platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body className={cn("bg-white", roboto.className)}> 
        {children}

        {/* Global providers only */}
        <AuthModalProvider />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
``