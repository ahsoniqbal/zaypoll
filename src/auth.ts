import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { getUserByEmail, registerUser } from "./services/user.services";
import { User } from "./types/user.types";

export const { handlers: { GET, POST }, auth, signIn, signOut, } = NextAuth({
    ...authConfig,
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
        }),
    ],
    callbacks: {
        async jwt({ token, profile }) {
            try {
                if (profile?.email) {

                    const userFound = await getUserByEmail(profile.email);

                    let appUser: User;

                    if (!userFound) {
                        appUser = await registerUser({
                            name: profile.name ?? "",
                            email: profile.email,
                            image: profile.picture,
                            // userName: profile.name ?? profile.email,
                        });
                    } else {
                        appUser = userFound;
                    }

                    token.userId = appUser.id;
                    token.userName = appUser.userName; // ADD THIS
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
                    session.user.id = token.userId as number;
                    session.user.userName = token.userName as string; //ADD THIS
                }

                return session;
            } catch (error) {
                console.error("SESSION CALLBACK ERROR:", error);
                return session;
            }
        },
    }

});