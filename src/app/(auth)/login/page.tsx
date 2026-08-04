import Image from "next/image";
import Link from "next/link";

import { googleLogin, sendMagicLink } from "@/actions/auth.action";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <CardHeader className="items-center px-6 pb-7 pt-8 text-center sm:px-8 sm:pt-10">
          <Link
            href="/"
            aria-label="ZayPoll home"
            className="mb-6 flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/icon.png"
              alt=""
              width={40}
              height={40}
              priority
              className="size-10 rounded-xl"
            />

            <span className="text-xl font-semibold tracking-tight text-foreground">
              Zay<span className="text-primary">poll</span>
            </span>
          </Link>

          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            Welcome back
          </CardTitle>

          <CardDescription className="mt-2 max-w-xs text-sm leading-6">
            Sign in to vote, create polls, and share your perspective.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 sm:px-8 sm:pb-10">
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
                htmlFor="login-email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>

              <Input
                id="login-email"
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
        </CardContent>
      </Card>
    </main>
  );
}