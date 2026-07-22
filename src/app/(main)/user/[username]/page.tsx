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
    searchParams: { page?: string };
}) {
    const session = await auth();
    const loggedInUserId = session?.user?.id ?? null;

    const { username } = await params;

    const user = await getUserDetails(username, loggedInUserId);

    if (!user) return notFound();

   

    const isOwnProfile = loggedInUserId === user.id;

    return (
        <main className="mx-auto w-full max-w-3xl space-y-8 px-1 py-4 sm:px-4 sm:py-8">

                <UserProfileHeader
                    user={user}
                    loggedInUserId={loggedInUserId}
                    isOwnProfile={isOwnProfile}
                />

                <UserContentSections
                    userId={user.id}
                    username={username}
                    searchParams={searchParams}
                />
        </main>
    );
}
