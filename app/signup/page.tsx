import { SignupForm } from "@/components/signup-form";
import { HeroHeader } from "@/components/header";

export default function SignupPage() {
  return (
    <>
      <HeroHeader />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 pt-24">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </>
  );
}
