"use client";

import Link from "next/link";
import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import {
  Home,
  Compass,
  User,
  PlusCircle,
  Users,
  Bell,
  Menu,
  X,
  LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { useAuthModal } from "@/hooks/useAuthModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/AppButton";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  authRequired?: boolean;
};

export default function Sidebar({
  isLoggedIn,
  username,
  unreadCount,
}: {
  isLoggedIn: boolean;
  username: string | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { open } = useAuthModal();

  const [isOpen, setIsOpen] = useState(false);

  const feed = searchParams.get("feed");

  const navItems: NavItem[] = [
    {
      name: "Feed",
      href: "/",
      icon: Home,
    },
    {
      name: "Following",
      href: "/?feed=following",
      icon: Users,
      authRequired: true,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      authRequired: true,
    },
    {
      name: "Profile",
      href: username ? `/user/${username}` : "/profile",
      icon: User,
      authRequired: true,
    },
  ];

  const handleProtectedNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    authRequired?: boolean
  ) => {
    if (authRequired && !isLoggedIn) {
      e.preventDefault();
      open();
      return;
    }

    setIsOpen(false);
  };

  const handleCreatePollClick = () => {
    if (!isLoggedIn) {
      open();
      return;
    }

    router.push("/polls/create");
  };

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        className="fixed left-4 top-[4.5rem] z-50 rounded-full bg-primary p-2 text-primary-foreground shadow-sm ring-1 ring-primary/10 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 md:sticky md:top-20",
          "h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6rem)]",
          "w-64 md:w-48",
          "bg-background md:bg-transparent",
          "border-r md:border-0",
          "p-4 pt-14 md:p-px",
          "flex shrink-0 flex-col space-y-6 overflow-y-auto overscroll-contain",
          "transform transition-transform duration-300 z-40",
          "md:mt-4",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Navigation Card */}
        <Card className="p-2">
          <CardContent className="p-0 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              let isActive = false;

              if (item.name === "Feed") {
                isActive = pathname === "/" && !feed;
              } else if (item.name === "Following") {
                isActive =
                  pathname === "/" &&
                  feed === "following";
              } else if (item.name === "Profile") {
                isActive = pathname.startsWith("/user");
              } else {
                isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleProtectedNavigation(
                      e,
                      item.authRequired
                    )
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  
                >
                  <Icon className="w-4 h-4" />

                  <span>{item.name}</span>

                  {item.name === "Notifications" && unreadCount > 0 && (
                    <Badge className="ml-auto min-w-5 justify-center px-1.5 py-0 text-[10px]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}

                  {item.authRequired && !isLoggedIn && (
                    <span className="sr-only">Login required</span>
                  )}
                </Link>
              );
            })}

            {/* Create Poll */}
            <AppButton
              onClick={handleCreatePollClick}
              className="mt-3 w-full gap-2"
              size="sm"
            >
              <PlusCircle size={16} />
              Create Poll
            </AppButton>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="px-2 text-xs leading-5 text-muted-foreground">
          <Link href="/explore" className="hover:text-foreground">Explore topics</Link>
          <span className="mx-1.5">·</span>
          © {new Date().getFullYear()} Zaypoll
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
