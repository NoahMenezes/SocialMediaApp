// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AdapterAccountType } from "next-auth/adapters";
import { db } from "@/backend/db";
import { users, accounts } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) {
                    return null;
                }

                try {
                    // Get user from Turso database
                    const existingUser = await db.query.users.findFirst({
                        where: eq(users.email, email),
                    });

                    if (!existingUser) {
                        return null;
                    }

                    // Check if user is verified
                    if (!existingUser.emailVerified) {
                        throw new Error("Please verify your email first");
                    }

                    // Verify password
                    // OAuth users might not have a password, so check for it
                    if (!existingUser.password) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        password,
                        existingUser.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: existingUser.id,
                        email: existingUser.email,
                        name: existingUser.name,
                    };
                } catch (error: any) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google sign-in
            if (account?.provider === "google") {
                try {
                    // Check if user exists
                    const existingUser = await db.query.users.findFirst({
                        where: eq(users.email, user.email!),
                    });

                    if (!existingUser) {
                        // Create new user for Google sign-in
                        const [newUser] = await db
                            .insert(users)
                            .values({
                                name: user.name || user.email!.split("@")[0],
                                email: user.email!,
                                emailVerified: new Date(), // Auto-verify Google users
                            })
                            .returning();

                        // Link account
                        await db.insert(accounts).values({
                            userId: newUser.id,
                            type: account.type as AdapterAccountType,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            access_token: account.access_token,
                            token_type: account.token_type as any,
                            scope: account.scope,
                            id_token: account.id_token,
                        });
                    } else {
                        // User exists, ensure they are verified
                        if (!existingUser.emailVerified) {
                            await db.update(users)
                                .set({ emailVerified: new Date() })
                                .where(eq(users.id, existingUser.id));
                        }

                        // Link account if missing
                        const existingAccount = await db.query.accounts.findFirst({
                            where: (accounts, { and, eq }) => and(
                                eq(accounts.provider, account.provider),
                                eq(accounts.providerAccountId, account.providerAccountId)
                            )
                        });

                        if (!existingAccount) {
                            await db.insert(accounts).values({
                                userId: existingUser.id,
                                type: account.type as AdapterAccountType,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                token_type: account.token_type as any,
                                scope: account.scope,
                                id_token: account.id_token,
                            });
                        }
                    }

                    return true;
                } catch (error: any) {
                    console.error("Google sign-in error:", error);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export const { GET, POST } = handlers;