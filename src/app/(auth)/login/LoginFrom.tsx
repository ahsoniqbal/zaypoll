"use client"

import { doCredentialLogin } from "@/actions/auth.action"

export default function LoginForm () {
    return (
        <div>
            <form action={doCredentialLogin}>
                <input type="email" name="email" placeholder="Email"/>
                <input type="password" name="email" placeholder="Password"/>
                <button>Login</button>
            </form>
        </div>
    )    
}