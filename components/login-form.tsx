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
import { login, signInWithGoogle, signInWithMastodon } from "@/backend/actions/auth";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mastodonLoading, setMastodonLoading] = useState(false);

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

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleMastodonSignIn() {
    setError("");
    setMastodonLoading(true);
    try {
      await signInWithMastodon();
    } catch (error) {
      setError("Failed to sign in with Mastodon. Please try again.");
      setMastodonLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <FieldGroup>
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
              disabled={loading || googleLoading}
              className="h-11 text-base font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator className="my-2">Or continue with</FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading || mastodonLoading}
              className="h-11 text-base w-full mb-3"
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

            <Button
              variant="outline"
              type="button"
              onClick={handleMastodonSignIn}
              disabled={loading || googleLoading || mastodonLoading}
              className="h-11 text-base w-full bg-[#563acc]/10 border-[#563acc]/20 hover:bg-[#563acc]/20 hover:border-[#563acc]/30 text-[#563acc] transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143v.074c.021 1.283.021 2.566.021 3.85 0 .27-.01 1.012.016 1.76.059 1.765.412 3.497 1.107 4.977.85 1.83 2.623 3.084 4.542 3.468 1.948.39 4.312.44 6.787.273 1.21-.082 2.378-.266 3.465-.544.157-.04.307-.08.455-.13l-.01-2.029c-1.921.464-3.92.651-5.811.53-3.031-.194-3.961-1.484-4.223-2.18-.088-.23-.153-.45-.192-.66 1.84.453 3.65.651 5.485.602 1.347-.036 2.502-.191 3.395-.314 1.144-.158 2.05-.386 2.871-.62.062-.018.12-.036.18-.055.674-.21 1.258-.456 1.782-.743.04-.022.08-.044.12-.067.892-.486 1.41-1.026 1.714-1.894.24-.687.214-1.637.214-1.93v-7.39c.002-.516-.002-1.033-.008-1.55zm-3.96 10.428h-2.464V8.124c0-1.262-.531-1.902-1.593-1.902-.857 0-1.442.548-1.748 1.166l-.587 1.307-.587-1.307c-.306-.618-.891-1.166-1.748-1.166-1.062 0-1.593.64-1.593 1.902v7.617H6.12V8.124c0-2.524 1.615-3.813 3.487-3.813 1.122 0 1.988.434 2.585 1.14l.814 1.091.814-1.091c.597-.706 1.463-1.14 2.585-1.14 1.872 0 3.487 1.289 3.487 3.813v7.617z" />
              </svg>
              <span className="ml-2">
                {mastodonLoading ? "Signing in..." : "Continue with Mastodon"}
              </span>
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
