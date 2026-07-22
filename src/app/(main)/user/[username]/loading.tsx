export default function UserPollsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="space-y-4 animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">Loading profile…</span>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
          <div className="mb-2 h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
