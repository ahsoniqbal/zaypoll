import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md bg-muted", className)}
    />
  );
}

export function MainContentLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mt-4 w-full max-w-3xl space-y-4 animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">Loading page…</span>
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </div>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-5 w-4/5" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormPageLoading() {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className="mx-auto mt-6 w-full max-w-3xl animate-pulse px-4 motion-reduce:animate-none"
    >
      <span className="sr-only">Loading form…</span>
      <div className="space-y-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function AuthPageLoading() {
  return (
    <div
      role="status"
      aria-label="Loading authentication page"
      className="flex min-h-screen w-full items-center justify-center px-4"
    >
      <span className="sr-only">Loading authentication page…</span>
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="animate-pulse space-y-5 motion-reduce:animate-none">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function RootPageLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <MainContentLoading />
    </div>
  );
}
