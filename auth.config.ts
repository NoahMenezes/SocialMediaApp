import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Mastodon from "next-auth/providers/mastodon";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/backend/db";
import { accounts, sessions, users, verificationTokens } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { AdapterAccountType } from "next-auth/adapters";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"]
    }
}

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
        Mastodon({
            clientId: process.env.MASTODON_CLIENT_ID!,
            clientSecret: process.env.MASTODON_CLIENT_SECRET!,
            issuer: process.env.MASTODON_INSTANCE_URL!,
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

                // Check if user is verified
                if (!user.emailVerified) {
                    throw new Error("Please verify your email first");
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
        async signIn({ user, account, profile }: any) {
            // Drizzle adapter already handles user creation and account linking.
            // We only need custom logic for Mastodon sync or other special fields.

            if (account?.provider === "mastodon" && user.id) {
                try {
                    await db.update(users)
                        .set({
                            mastodonId: account.providerAccountId,
                            mastodonAccessToken: account.access_token,
                            mastodonInstanceUrl: process.env.MASTODON_INSTANCE_URL,
                        })
                        .where(eq(users.id, user.id));
                } catch (error) {
                    console.error("Mastodon sync error during sign-in:", error);
                }
            }

            return true;
        },
        async session({ session, user, token }: any) {
            if (session.user && (user?.id || token?.id)) {
                session.user.id = user?.id || (token?.id as string);
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
});
