import { auth } from "@/auth";
import UserContentSections from "@/components/user/UserContentSections";
import UserProfileHeader from "@/components/user/UserProfileHeader";
import { getUserDetails } from "@/services/user.services";
import { notFound } from "next/navigation";


export default async function UserPage({
    params,
    searchParams,
}: {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const session = await auth();
    const loggedInUserId = session?.user?.id ?? null;

    const [{ username }, resolvedSearchParams] = await Promise.all([params, searchParams]);

    const user = await getUserDetails(username, loggedInUserId);

    if (!user) return notFound();

   

    const isOwnProfile = loggedInUserId === user.id;

    return (
        <main className="content-shell space-y-6">

                <UserProfileHeader
                    user={user}
                    loggedInUserId={loggedInUserId}
                    isOwnProfile={isOwnProfile}
                />

                <UserContentSections
                    userId={user.id}
                    username={username}
                    searchParams={resolvedSearchParams}
                />
        </main>
    );
}
