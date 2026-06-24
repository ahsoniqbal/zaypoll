import { getAllUsers } from "@/services/user.services"
import UserList from "./UserList";
import UserForm from "./UserForm";
import { User } from "@/types/user.types";

export default async function Users({ searchParams }: { searchParams: Promise<{ query: string }> }) {
    const { query } = await searchParams;

    const users: User[] = await getAllUsers(query);
    return (

        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
                <UserList users={users} />
                <UserForm />
            </div>
        </div>

    )
}