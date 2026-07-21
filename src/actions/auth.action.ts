'use server'

import { signIn, signOut } from "@/auth";
import { consumeAuthRateLimit } from "@/lib/server/auth-rate-limit";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MAGIC_LINK_WINDOW_SECONDS = 15 * 60;
const MAGIC_LINK_EMAIL_LIMIT = 3;
const MAGIC_LINK_IP_LIMIT = 10;

export async function googleLogin() {
  await signIn("google", { redirectTo: "/" });
}

export async function doLogout() {
  await signOut({ redirectTo: "/" });
}


export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return;
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim()
    || requestHeaders.get("x-real-ip")
    || "unknown";

  const emailAllowed = await consumeAuthRateLimit({
    key: `magic-link:email:${email}`,
    limit: MAGIC_LINK_EMAIL_LIMIT,
    windowSeconds: MAGIC_LINK_WINDOW_SECONDS,
  });
  const ipAllowed = await consumeAuthRateLimit({
    key: `magic-link:ip:${clientIp}`,
    limit: MAGIC_LINK_IP_LIMIT,
    windowSeconds: MAGIC_LINK_WINDOW_SECONDS,
  });

  if (!emailAllowed || !ipAllowed) {
    // Use the same confirmation screen so callers cannot enumerate accounts.
    redirect("/api/auth/verify-request?provider=resend&type=email");
  }

  await signIn("resend", { email, redirectTo: "/" });
}


export async function doCredentialLogin(formData: FormData) {
  console.log("formData", formData);

  try {
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    revalidatePath("/");
    return response;
  } catch (err) {
    throw err;
  }
}
