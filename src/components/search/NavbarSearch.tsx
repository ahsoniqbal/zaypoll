"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export default function NavbarSearch() {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  return (
    <form action="/search" method="GET" className="relative w-full">
      <label htmlFor="global-search" className="sr-only">
        Search polls and people
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        key={currentQuery}
        id="global-search"
        name="q"
        defaultValue={currentQuery}
        maxLength={100}
        placeholder="Search polls and people"
        className="w-full rounded-full bg-muted/60 pl-9 shadow-none"
      />
    </form>
  );
}
