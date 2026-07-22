import { getAllUsers } from "@/services/user.services"
import UserList from "./UserList";
import UserForm from "./UserForm";
import { User } from "@/types/user.types";

export default async function Users({ searchParams }: { searchParams: Promise<{ query: string }> }) {
    const { query } = await searchParams;

    const users: User[] = await getAllUsers(query);
    return (

        <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                <UserList users={users} />
                <UserForm />
            </div>
        </main>

    )
}
