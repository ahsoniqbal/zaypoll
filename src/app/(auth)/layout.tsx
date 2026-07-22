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

      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-10">
        {children}
      </main>
    </>
  );
}
