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
import { login } from "@/backend/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground text-base text-balance">
              Enter your credentials to access your account
            </p>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
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
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel htmlFor="password" className="text-base">
                Password
              </FieldLabel>
              <a
                href="#"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 text-base"
            />
          </Field>
          <Field className="mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 text-base font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator className="my-2">Or continue with</FieldSeparator>
          <Field>
            <Button variant="outline" type="button" className="h-11 text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              <span className="ml-2">Login with GitHub</span>
            </Button>
            <FieldDescription className="text-center text-base mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
              >
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
