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
  LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { useAuthModal } from "@/hooks/useAuthModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
}: {
  isLoggedIn: boolean;
  username: string | null;
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
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-16 left-4 z-50 bg-primary text-white px-3 py-2 rounded-md shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0",
          "h-screen md:h-auto",
          "w-64 md:w-48",
          "bg-background md:bg-transparent",
          "border-r md:border-0",
          "p-4 md:p-0",
          "flex flex-col space-y-6 shrink-0",
          "transform transition-transform duration-300 z-40",
          "mt-4",
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "hover:bg-muted"
                  )}
                  
                >
                  <Icon className="w-4 h-4" />

                  <span>{item.name}</span>

                  {item.authRequired && !isLoggedIn && (
                    <span className="ml-auto text-xs">
                      🔒
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Create Poll */}
            <AppButton
              onClick={handleCreatePollClick}
              className="mt-4 w-full gap-2"
              size="sm"
            >
              <PlusCircle size={16} />
              Create Poll
            </AppButton>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader className="border-b">
            <h3 className="font-semibold">
              Popular Topics
            </h3>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {[
              "NextJS",
              "TailwindCSS",
              "UIUX",
              "WebDev",
              "Design",
              "Productivity",
              "RemoteWork",
            ].map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
              >
                {topic}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} Zaypoll
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}