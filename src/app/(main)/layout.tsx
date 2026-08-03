// app/(main)/layout.tsx
import { fetchUnreadCount } from "@/actions/notification.action";
import Navbar from "@/components/navbar";
import RightSidebar from "@/components/RightSide";
import Sidebar from "@/components/Sidebar";
import { getAuthState, getCurrentUser } from "@/lib/server/auth.utils";
import { Suspense } from "react";
import ProfileCompletionProvider from "@/components/profile/ProfileCompletionProvider";
import { getProfileCompletion } from "@/services/user.services";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = await getAuthState();
  const user = await getCurrentUser();
  const unreadCount = await fetchUnreadCount();
  const profile = user?.id ? await getProfileCompletion(Number(user.id)) : null;

  return (
    <ProfileCompletionProvider profile={profile}>
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Navbar isLoggedIn={isLoggedIn} user={user} />


      {/* --- Main Layout --- */}
      <div className="flex w-full justify-center px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
        <div className="flex w-full max-w-7xl items-start gap-5 lg:gap-8">


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
    </ProfileCompletionProvider>
  )

}
