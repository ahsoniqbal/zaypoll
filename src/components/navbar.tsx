"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Home, Compass, Bell, SquarePlus, User, Search, LogOut } from "lucide-react";
import Logout from "./Logout";

import { useState } from "react";
import {
  fetchNotifications,
  readNotification,
} from "@/actions/notification.action";

import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types/notification.types";
import { getNotificationMessage } from "@/lib/common.helper";
import { AppButton } from "./AppButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


export default function Navbar({
  isLoggedIn,
  user,
  unreadCount,
}: {
  isLoggedIn: boolean;
  user: {
    id: number;
    userName: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(unreadCount);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load only once
  const loadNotifications = async () => {
    if (loaded) return;

    setLoading(true);

    try {
      const data = await fetchNotifications();
      setNotifications(data || []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Click handler
  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      void readNotification(n.id);
    }

    if (n.type === "USER_FOLLOWED" && n.data?.userId) {
      router.push(`/user/${n.data.userId}`);
    }

    if (
      (n.type === "POLL_VOTED" || n.type === "REASON_ADDED") &&
      n.data?.pollId
    ) {
      router.push(`/polls/${n.data.pollId}`);
    }

    if (n.type === "COMMENT_REACTED" && n.data?.pollId) {
      router.push(`/polls/${n.data.pollId}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8 gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-2 shrink-0 w-40">
          <Link href="/">
            <h1 className="text-xl font-semibold">Zaypoll</h1>
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
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search polls, topics, users..." className="pl-9 w-full" /> */}
            <form action="/search" method="GET">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search"
                className="pl-9 w-full"
              />
            </form>
          </div>
        </div>


        {/* MIDDLE */}
        <div className="flex items-center gap-2 shrink-0 justify-end w-40">

          {/* NOTIFICATIONS */}
          <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>

            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />

                {/* BADGE */}
                {count > 0 && (
                  // <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">
                  //   {count}
                  // </span>

                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>


                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* LOADING */}
              {loading && (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading...
                </div>
              )}

              {/* EMPTY */}
              {!loading && notifications.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">
                  No notifications
                </div>
              )}

              {/* LIST */}

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n)}
                    className="flex flex-col items-start py-3 cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>TC</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="text-sm font-medium">Travel Community</p>
                        <p className="text-xs text-muted-foreground">{getNotificationMessage(n)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}</span>

                    </div>


                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                    {user.image ? (

                      <Avatar>
                        <AvatarImage src={user.image} alt="@shadcn" />
                        <AvatarFallback>AA</AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="w-6 h-6" />
                    )}
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
        </div>

      </div>
    </nav>
  );
}