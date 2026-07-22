import Link from "next/link";

import { googleLogin, sendMagicLink } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl tracking-tight">Welcome to Zaypoll</CardTitle>
        <p className="text-sm text-muted-foreground">Sign in to vote, publish polls, and join discussions.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={googleLogin}>
          <Button type="submit" variant="outline" size="lg" className="w-full">Continue with Google</Button>
        </form>
        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-border" /><span className="text-xs uppercase tracking-wider text-muted-foreground">or</span><div className="h-px flex-1 bg-border" />
        </div>
        <form action={sendMagicLink} className="space-y-3">
          <label htmlFor="login-email" className="text-sm font-medium">Email address</label>
          <Input id="login-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
          <Button type="submit" size="lg" className="w-full">Email me a sign-in link</Button>
        </form>
        <p className="text-center text-xs leading-5 text-muted-foreground">No password required. We’ll send you a secure sign-in link.</p>
        <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">Continue browsing</Link>
      </CardContent>
    </Card>
  );
}
