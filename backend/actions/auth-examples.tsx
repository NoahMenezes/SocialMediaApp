"use client";

// Example usage of the authentication functions

import { signInWithGoogle, login, signup, logout, getCurrentUser } from "@/backend/actions/auth";

// ============================================
// USAGE EXAMPLES
// ============================================

// 1. GOOGLE SIGN-IN (in a client component with a form)
// --------------------------------------------
export function GoogleSignInButton() {
    return (
        <form action={signInWithGoogle}>
            <button type="submit" className="google-signin-btn">
                <svg>...</svg> {/* Google icon */}
                Sign in with Google
            </button>
        </form>
    );
}

// 2. EMAIL/PASSWORD SIGN-UP (in a client component)
// --------------------------------------------
export function SignupForm() {
    async function handleSignup(formData: FormData) {
        const result = await signup(formData);

        if (result.error) {
            // Show error message
            console.error(result.error);
        } else if (result.success) {
            // Redirect to login or home
            console.log("Success:", result.message);
            // window.location.href = "/login";
        }
    }

    return (
        <form action={handleSignup}>
            <input type="text" name="name" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
        </form>
    );
}

// 3. EMAIL/PASSWORD LOGIN (in a client component)
// --------------------------------------------
export function LoginForm() {
    async function handleLogin(formData: FormData) {
        const result = await login(formData);

        if (result.error) {
            // Show error message
            console.error(result.error);
        } else if (result.success) {
            // Redirect to home
            window.location.href = "/";
        }
    }

    return (
        <form action={handleLogin}>
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Log In</button>
        </form>
    );
}

// 4. LOGOUT (in any component)
// --------------------------------------------
export function LogoutButton() {
    return (
        <form action={logout}>
            <button type="submit">Log Out</button>
        </form>
    );
}

// 5. GET CURRENT USER (in a server component)
// --------------------------------------------
export async function UserProfile() {
    const user = await getCurrentUser();

    if (!user) {
        return <div>Not logged in</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Email: {user.email}</p>
            {user.image && <img src={user.image} alt={user.name} />}
        </div>
    );
}

// 6. PROTECTED PAGE (in a server component)
// --------------------------------------------
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/backend/actions/auth";

export default async function ProtectedPage() {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        redirect("/login");
    }

    return (
        <div>
            <h1>Protected Content</h1>
            <p>Only authenticated users can see this.</p>
        </div>
    );
}
