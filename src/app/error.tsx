"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">We couldn’t load this page. Your data is safe—please try again.</p>
        <Button onClick={reset} className="mt-6"><RotateCcw />Try again</Button>
      </div>
    </main>
  );
}
