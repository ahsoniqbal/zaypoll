import { getUser } from "@/services/user.services"
import { notFound } from "next/navigation";
import UserUpdate from "./UserUpdate";
import { User } from "@/types/user.types";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user: User | null = await getUser(parseInt(id));

    if (!user) {
        notFound();
    }

    return (

        <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                <UserUpdate user={user}/>
            </div>
        </main>

    )
}
