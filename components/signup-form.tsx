"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signup, signInWithGoogle } from "@/backend/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await signup(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(result.message || "Account created successfully!");
      setLoading(false);
      // Redirect to login page after 1.5 seconds
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setSuccess("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full rounded-lg border bg-card p-8 shadow-lg">
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-base text-balance">
              Fill in the information below to get started
            </p>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm p-4 rounded-lg border border-green-200 dark:border-green-900">
              {success}
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="name" className="text-base">
              Full Name
            </FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              className="h-11 text-base"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email" className="text-base">
              Email Address
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
              className="h-11 text-base"
            />
            <FieldDescription className="text-sm">
              We&apos;ll use this to contact you. We will not share your email
              with anyone else.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-base">
              Password
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 text-base"
            />
            <FieldDescription className="text-sm">
              Must be at least 8 characters with uppercase, lowercase, and a
              number.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password" className="text-base">
              Confirm Password
            </FieldLabel>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              className="h-11 text-base"
            />
            <FieldDescription className="text-sm">
              Please confirm your password.
            </FieldDescription>
          </Field>
          <Field className="mt-2">
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="h-11 text-base font-semibold"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </Field>
          <FieldSeparator className="my-2">Or continue with</FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="h-11 text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="ml-2">
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </Button>
            <FieldDescription className="text-center text-base mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
              >
                Sign in
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
