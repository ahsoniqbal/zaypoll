import Image from "next/image";
import { UserDetails } from "@/types/user.types";
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
  const showFollowButton = !isOwnProfile;

  return (

    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

      {/* LEFT */}
      <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">

        {/* Avatar */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10 sm:h-24 sm:w-24">
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name}'s profile photo`}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-muted-foreground">
              {(user.name || user.userName).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 pt-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {user.name}
          </h1>

          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            @{user.userName}
          </p>

          <div className="mt-4">
            <FollowStats
              userId={user.id}
              followersCount={user.followersCount}
              followingCount={user.followingCount}
            />
          </div>
          <div className="mt-4 border-t pt-4">
            <Suspense fallback={<StatsSkeleton />}>
              <UserStatsSection userId={user.id} />
            </Suspense>
          </div>
        </div>


      </div>

      {/* RIGHT */}
      {showFollowButton && (
        <div className="w-full sm:w-auto sm:self-start">
          <FollowButton
            userId={user.id}
            initialIsFollowing={user.isFollowing}
            isLoggedIn={!!loggedInUserId}
          />
        </div>
      )}
      </div>

      <p className="mt-5 border-t pt-4 text-xs text-muted-foreground sm:ml-[7.25rem]">
        Joined {new Date(user.joinedOn).toLocaleDateString("en", {
          month: "long",
          year: "numeric",
        })}
      </p>
    </section>
  );

}



function StatsSkeleton() {
  return (
    <div className="flex gap-6 animate-pulse motion-reduce:animate-none">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="mb-1 h-4 w-10 rounded bg-muted" />
          <div className="h-3 w-14 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
