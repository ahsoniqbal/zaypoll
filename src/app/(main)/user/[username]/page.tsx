import { auth } from "@/auth";
import UserContentSections from "@/components/user/UserContentSections";
import UserProfileHeader from "@/components/user/UserProfileHeader";
import { getUserDetails, getUserStats } from "@/services/user.services";
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

    // const user = await getUserDetails(username, loggedInUserId);



    const user = await getUserDetails(username, loggedInUserId);

    if (!user) return notFound();

   

    const isOwnProfile = loggedInUserId === user.id;

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-4xl mx-auto space-y-6 px-4">

                <UserProfileHeader
                    user={user}
                    loggedInUserId={loggedInUserId}
                    isOwnProfile={isOwnProfile}
                />

                <UserContentSections
                    userId={user.id}
                    loggedInUserId={loggedInUserId}
                    username={username}
                    searchParams={searchParams}
                />

            </div>
        </div>
    );
}