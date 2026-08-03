import { auth } from "@/auth";
import { getUser } from "@/services/user.services";


export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const current = await getUser(Number(session.user.id));
  return current ? { ...session.user, ...current } : null;
}

export async function getAuthState() {
  const session = await auth();

  return {
    user: session?.user ?? null,
    isLoggedIn: !!session?.user?.id,
  };
}
