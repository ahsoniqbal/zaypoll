"use client";

import { X } from "lucide-react";
import { googleLogin, sendMagicLink } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { isOpen: boolean; onClose: () => void };

export default function LoginModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title" className="relative w-full max-w-md rounded-t-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/10 sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close sign-in dialog" className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <h2 id="login-modal-title" className="text-center text-xl font-semibold tracking-tight">Welcome to Zaypoll</h2>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Sign in to vote and join the discussion.</p>
        <form action={googleLogin} className="mb-4">
          <Button type="submit" variant="outline" size="lg" className="w-full">Continue with Google</Button>
        </form>
        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-border" /><span className="text-xs uppercase tracking-wider text-muted-foreground">or</span><div className="h-px flex-1 bg-border" />
        </div>
        <form action={sendMagicLink} className="space-y-3">
          <label htmlFor="modal-email" className="text-sm font-medium">Email address</label>
          <Input id="modal-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
          <Button type="submit" size="lg" className="w-full">Email me a sign-in link</Button>
        </form>
      </div>
    </div>
  );
}
