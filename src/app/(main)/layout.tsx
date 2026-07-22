// app/(main)/layout.tsx
import { fetchUnreadCount } from "@/actions/notification.action";
import Navbar from "@/components/navbar";
import RightSidebar from "@/components/RightSide";
import Sidebar from "@/components/Sidebar";
import { getAuthState, getCurrentUser } from "@/lib/server/auth.utils";
import { Suspense } from "react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = await getAuthState();
  const user = await getCurrentUser();
  const unreadCount = await fetchUnreadCount();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <Navbar isLoggedIn={isLoggedIn} user={user} />


      {/* --- Main Layout --- */}
      <div className="flex w-full justify-center px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
        {/* Increased from max-w-6xl to max-w-7xl for more total width */}
        <div className="flex w-full max-w-7xl gap-5 lg:gap-8">


          <Suspense fallback={<div aria-hidden="true" className="hidden w-48 shrink-0 md:block" />}>
            <Sidebar
              isLoggedIn={isLoggedIn}
              username={user?.userName ?? null}
              unreadCount={unreadCount}
            />
          </Suspense>
          <div className="min-w-0 grow">{children}</div>

          <RightSidebar />
        </div>
      </div>
    </div>
  )

}
