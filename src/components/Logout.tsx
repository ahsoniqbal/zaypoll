"use client"

import { doLogout } from "@/actions/auth.action"
import posthog from "posthog-js"

const Logout = () => {
  const handleLogout = () => {
    posthog.reset()
  }

  return (
    <form action={doLogout}>
        <button onClick={handleLogout} className="w-full text-left text-sm px-2 py-1.5 hover:bg-muted rounded-sm" type="submit">Logout</button>
    </form>
  )
}

export default Logout