import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // ✅ USE THIS

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const session = await auth();
  const isAuthenticated = !!session?.user;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  //ALWAYS RETURN
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};