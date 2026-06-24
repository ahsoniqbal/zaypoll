import { getUserStats } from "@/services/user.services";

export default async function UserStatsSection({ userId }: any) {
  const userStats = await getUserStats(userId);

  return (
     <div className="flex gap-6 mt-4 text-sm">

            <div>
              <p className="font-semibold text-gray-900">{userStats.totalPolls ?? 0}</p>
              <p className="text-gray-500 text-xs">Polls</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">{userStats.totalVotes ?? 0}</p>
              <p className="text-gray-500 text-xs">Votes</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">{userStats.totalComments ?? 0}</p>
              <p className="text-gray-500 text-xs">Comments</p>
            </div>

          </div>

  );
}
