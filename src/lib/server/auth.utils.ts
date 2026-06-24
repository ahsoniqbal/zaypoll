import { auth } from "@/auth";


export async function getCurrentUser() {
  const session = await auth();

  return session?.user ?? null;
}

export async function getAuthState() {
  const session = await auth();

  return {
    user: session?.user ?? null,
    isLoggedIn: !!session?.user?.id,
  };
}