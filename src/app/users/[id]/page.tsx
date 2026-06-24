import { getUser } from "@/services/user.services"
import { notFound } from "next/navigation";
import UserUpdate from "./UserUpdate";
import { User } from "../user";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user: User | null = await getUser(parseInt(id));

    if (!user) {
        notFound();
    }

    return (

        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
                <UserUpdate user={user}/>
            </div>
        </div>

    )
}