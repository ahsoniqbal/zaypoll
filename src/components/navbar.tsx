"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { User, Search, LogOut } from "lucide-react";
import Logout from "./Logout";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuthModal } from "@/hooks/useAuthModal";
import { getInitials } from "@/lib/utils";


export default function Navbar({
  isLoggedIn = false,
  user = null,
}: {
  isLoggedIn?: boolean;
  user?: {
    id: number;
    userName: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}) {
  const { open } = useAuthModal();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-4 px-4 md:px-8">

        {/* LEFT */}
        <div className="flex shrink-0 items-center gap-2 md:w-40">
          <Link href="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring">
            <span className="text-xl font-semibold tracking-tight">Zay<span className="text-primary">poll</span></span>
          </Link>

          {/* <form action="/search" method="GET" className="hidden md:block w-64">
            <Input
              name="q"
              placeholder="Search"
              className="bg-muted border-none focus-visible:ring-0"
            />
          </form> */}
        </div>



        {/* Search (Center) */}
        <div className="hidden flex-1 justify-center sm:flex">
          <div className="relative w-full max-w-md">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search polls, topics, users..." className="pl-9 w-full" /> */}
            <form action="/search" method="GET">
              <label htmlFor="global-search" className="sr-only">Search polls</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="global-search"
                name="q"
                placeholder="Search polls"
                className="w-full rounded-full bg-muted/60 pl-9 shadow-none"
              />
            </form>
          </div>
        </div>


        {/* MIDDLE */}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 md:w-40">

          {isLoggedIn && user && (
            <>
              {/* <Button asChild variant="outline" className="rounded-full px-4">
                <Link href="/polls/create">
                  <SquarePlus className="w-4 h-4 mr-1" />
                  Create
                </Link>
              </Button> */}




              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar>
                      {user.image && (
                        <AvatarImage src={user.image} alt={`${user.name || user.userName}'s profile`} />
                      )}
                      <AvatarFallback>{getInitials(user.name, user.userName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>


                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/user/${user.userName}`}> <User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <Logout />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isLoggedIn && (
            <Button type="button" size="sm" onClick={open}>
              Log in
            </Button>
          )}
        </div>

      </div>
    </nav>
  );
}
