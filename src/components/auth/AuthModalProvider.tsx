"use client";

import LoginModal from "@/components/auth/LoginModel";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AuthModalProvider() {
  const { isOpen, open, close } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth") !== "login") return;

    open();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("auth");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [open, pathname, router, searchParams]);

  return <LoginModal isOpen={isOpen} onClose={close} />;
}
