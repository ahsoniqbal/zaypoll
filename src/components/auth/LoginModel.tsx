"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { googleLogin, sendMagicLink } from "@/actions/auth.action";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { isOpen: boolean; onClose: () => void };

export default function LoginModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
        className="relative w-full max-w-md animate-in rounded-t-2xl border border-border/70 bg-card px-6 pb-8 pt-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)] duration-200 slide-in-from-bottom-4 sm:rounded-2xl sm:px-8 sm:pb-8 sm:pt-8 sm:fade-in sm:zoom-in-95"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="absolute right-3 top-3 size-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </Button>

        <div className="text-center">
          <Image
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="mx-auto size-10 rounded-xl"
          />

          <h2
            id="login-modal-title"
            className="mt-5 text-2xl font-semibold tracking-tight text-foreground"
          >
            Welcome to Zaypoll
          </h2>

          <p
            id="login-modal-description"
            className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground"
          >
            Sign in to vote, create polls, and share your perspective.
          </p>
        </div>

        <div className="mt-7 space-y-6">
          <form action={googleLogin}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-11 w-full rounded-lg bg-background font-medium shadow-none hover:bg-muted/60"
            >
              <GoogleIcon className="size-5" />
              Continue with Google
            </Button>
          </form>

          <div
            className="flex items-center gap-3 text-muted-foreground"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form action={sendMagicLink} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="modal-email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>

              <Input
                id="modal-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                required
                className="h-11 rounded-lg bg-background shadow-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-lg font-medium"
            >
              Send sign-in link
            </Button>
          </form>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            We’ll email you a secure, one-time link. No password required.
          </p>
        </div>
      </div>
    </div>
  );
}
