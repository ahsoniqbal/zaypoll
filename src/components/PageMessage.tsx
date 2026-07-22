import Link from "next/link";
import { CircleAlert, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-muted"><SearchX className="h-5 w-5 text-muted-foreground" /></span>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {actionHref && actionLabel && <Button asChild className="mt-5"><Link href={actionHref}>{actionLabel}</Link></Button>}
    </div>
  );
}

export function NotFoundState({ resource }: { resource: string }) {
  return (
    <main className="mx-auto mt-4 w-full max-w-3xl rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
      <CircleAlert className="mx-auto h-8 w-8 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold tracking-tight">{resource} not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have been removed or the link may be incorrect.</p>
      <Button asChild className="mt-6"><Link href="/">Return to feed</Link></Button>
    </main>
  );
}
