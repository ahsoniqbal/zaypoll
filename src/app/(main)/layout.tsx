// app/(main)/layout.tsx
import { fetchUnreadCount } from "@/actions/notification.action";
import Navbar from "@/components/navbar";
import RightSidebar from "@/components/RightSide";
import Sidebar from "@/components/Sidebar";
import { getAuthState, getCurrentUser } from "@/lib/server/auth.utils";

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
      <Navbar isLoggedIn={isLoggedIn} user={user} unreadCount={unreadCount} />


      {/* --- Main Layout --- */}
      <div className="flex w-full justify-center p-4 md:p-6 lg:p-8">
        {/* Increased from max-w-6xl to max-w-7xl for more total width */}
        <div className="flex w-full max-w-7xl gap-8">


          <Sidebar isLoggedIn={isLoggedIn} username={user?.userName ?? null} />
          <main className="grow">{children}</main>

          <RightSidebar />
        </div>
      </div>
    </div>
  )

}