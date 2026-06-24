'use server'

import { signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";

export async function googleLogin() {
  await signIn("google", { redirectTo: "/" });
}

export async function doLogout() {
  await signOut({ redirectTo: "/" });
}


export async function sendMagicLink(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { success: false, message: "Missing fields" };
  }

  // TODO:
  // 1. Generate token
  // 2. Save in DB
  // 3. Send email with link

  console.log("Magic link requested:", { name, email });

  return {
    success: true,
    message: "Magic link sent",
  };
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