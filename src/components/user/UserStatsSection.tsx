import { getUserStats } from "@/services/user.services";

export default async function UserStatsSection({ userId }: { userId: number }) {
  const userStats = await getUserStats(userId);

  return (
     <dl className="flex flex-wrap gap-x-6 gap-y-3 text-sm">

            <div className="min-w-12">
              <dd className="font-semibold tabular-nums text-foreground">{userStats.totalPolls ?? 0}</dd>
              <dt className="text-xs text-muted-foreground">Polls</dt>
            </div>

            <div>
              <dd className="font-semibold tabular-nums text-foreground">{userStats.totalVotes ?? 0}</dd>
              <dt className="text-xs text-muted-foreground">Votes</dt>
            </div>

            <div>
              <dd className="font-semibold tabular-nums text-foreground">{userStats.totalComments ?? 0}</dd>
              <dt className="text-xs text-muted-foreground">Comments</dt>
            </div>

          </dl>

  );
}
