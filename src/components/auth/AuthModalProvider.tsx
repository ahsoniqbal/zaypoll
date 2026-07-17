"use client";

import LoginModal from "@/components/auth/LoginModel";
import { useAuthModal } from "@/hooks/useAuthModal";

export default function AuthModalProvider() {
  const { isOpen, close } = useAuthModal();

  return <LoginModal isOpen={isOpen} onClose={close} />;
}
