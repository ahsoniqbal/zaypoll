import { doLogout } from "@/actions/auth.action"

const Logout = () => {
  return (
    <form action={doLogout}>
        <button className="w-full text-left text-sm px-2 py-1.5 hover:bg-muted rounded-sm" type="submit">Logout</button>
    </form>
  )
}

export default Logout