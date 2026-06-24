import { UserDetails, UserStats } from "@/types/user.types";
import FollowButton from "../FollowButton";
import FollowStats from "./FollowStats";
import UserStatsSection from "./UserStatsSection";
import { Suspense } from "react";

type Props = {
  user: UserDetails;
  loggedInUserId: number | null;
  isOwnProfile: boolean;
};

export default function UserProfileHeader({
  user,
  loggedInUserId,
  isOwnProfile
}: Props) {
  const showFollowButton = loggedInUserId && !isOwnProfile;

  return (

    <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">

      {/* LEFT */}
      <div className="flex items-start gap-5">

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shadow ring-1 ring-gray-200">
          {user.image ? (
            <img src={user.image} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xl font-semibold text-gray-600">
              {user.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {user.name}
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            @{user.userName}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Joined {new Date(user.joinedOn).toLocaleDateString()}
          </p>

          <div className="mt-3">
            <FollowStats
              userId={user.id}
              followersCount={user.followersCount}
              followingCount={user.followingCount}
            />
          </div>
          <div className="mt-3 pt-3 border-t">
            <Suspense fallback={<StatsSkeleton />}>
              <UserStatsSection userId={user.id} />
            </Suspense>
          </div>
        </div>


      </div>

      {/* RIGHT */}
      {showFollowButton && (
        <div className="self-start md:self-auto">
          <FollowButton
            userId={user.id}
            initialIsFollowing={user.isFollowing}
          />
        </div>
      )}
    </div>
  );

}



function StatsSkeleton() {
  return (
    <div className="flex gap-6 mt-4 text-sm animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-4 w-10 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-14 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}