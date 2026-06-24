// app/(auth)/layout.tsx
import Navbar from "@/components/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="flex items-center justify-center min-h-screen">
        {children}
      </main>
    </>
  );
}