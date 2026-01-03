import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/backend/db";
import { accounts, sessions, users, verificationTokens } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // Find user by email
                const user = await db.query.users.findFirst({
                    where: eq(users.email, email),
                });

                if (!user) {
                    return null;
                }

                // Check if user has a password (OAuth users might not)
                if (!user.password) {
                    return null;
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password);

                if (!isValidPassword) {
                    return null;
                }

                // Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async session({ session, user, token }) {
            // For database strategy, user is available
            if (user) {
                session.user.id = user.id;
            }
            // For JWT strategy, use token
            if (token) {
                session.user.id = token.sub!;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },

});

