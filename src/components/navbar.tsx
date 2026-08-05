"use client";

import { Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import Logout from "@/components/Logout";
import NavbarSearch from "@/components/search/NavbarSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthModal } from "@/hooks/useAuthModal";
import { getInitials } from "@/lib/utils";
import posthog from "posthog-js";

type NavbarProps = {
  isLoggedIn?: boolean;
  user?: {
    id: number;
    userName: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export default function Navbar({
  isLoggedIn = false,
  user = null,
}: NavbarProps) {
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    posthog.identify(String(user.id), {
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      user_name: user.userName,
    });
  }, [isLoggedIn, user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 w-full max-w-[96rem] items-center gap-3 px-3 sm:h-16 sm:gap-5 sm:px-5 md:px-8"
      >
        {/* Logo */}
        <div className="shrink-0 sm:min-w-36">
          <Link
            href="/"
            aria-label="Zaypoll home"
            className="inline-flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              priority
              className="size-8 rounded-lg sm:size-9 sm:rounded-xl"
            />

            <span className="hidden text-xl font-semibold tracking-tight text-foreground sm:inline">
              Zay<span className="text-primary">poll</span>
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-lg">
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-10 w-full animate-pulse rounded-lg bg-muted/70"
                />
              }
            >
              <NavbarSearch />
            </Suspense>
          </div>
        </div>

        {/* Account actions */}
        <div className="flex shrink-0 justify-end sm:min-w-36">
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open account menu"
                  className="size-10 rounded-full p-0 hover:bg-muted"
                >
                  <Avatar className="size-9 border border-border">
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={`${user.name || user.userName}'s profile`}
                      />
                    )}

                    <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                      {getInitials(user.name, user.userName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-60 rounded-xl p-1.5 shadow-lg"
              >
                <DropdownMenuLabel className="px-2 py-2 font-normal">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name || user.userName}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      @{user.userName}
                    </p>

                    {user.email && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg px-2 py-2"
                >
                  <Link href={`/user/${user.userName}`}>
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer rounded-lg px-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="size-4" />
                  <Logout />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              onClick={open}
              size="sm"
              className="h-8 shrink-0 px-4 bg-background text-black rounded-full border hover:bg-accent font-medium transition-transform active:scale-[0.98] cursor-pointer"
            >
              Log in
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}