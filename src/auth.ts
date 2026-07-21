import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import ResendProvider from "next-auth/providers/resend";
import { authConfig } from "./auth.config";
import { MySqlAuthAdapter } from "./lib/server/mysql-auth.adapter";

export const { handlers: { GET, POST }, auth, signIn, signOut, } = NextAuth({
    ...authConfig,
    adapter: MySqlAuthAdapter(),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
            allowDangerousEmailAccountLinking: true,
        }),
        ResendProvider({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.AUTH_RESEND_FROM ?? "Zaypoll <onboarding@resend.dev>",
            maxAge: 15 * 60,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            try {
                if (user?.id) {
                    token.userId = Number(user.id);
                    token.userName = (user as typeof user & { userName?: string }).userName ?? "";
                }

                return token;
            } catch (error) {
                console.error("JWT CALLBACK ERROR:", error);
                throw new Error("Authentication failed");
            }
        },

        async session({ session, token }) {
            try {

                if (session.user) {
                    const appUser = session.user as unknown as { id: number; userName: string };
                    appUser.id = Number(token.userId);
                    appUser.userName = String(token.userName ?? "");
                }

                return session;
            } catch (error) {
                console.error("SESSION CALLBACK ERROR:", error);
                return session;
            }
        },
    }

});
