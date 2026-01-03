import { SignupForm } from "@/components/signup-form";
import { HeroHeader } from "@/components/header";
import { AnimatedPage, FadeIn } from "@/components/animated-page";

export default function SignupPage() {
  return (
    <>
      <HeroHeader />
      <AnimatedPage>
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 pt-24">
          <FadeIn className="w-full max-w-md" delay={0.1}>
            <SignupForm />
          </FadeIn>
        </div>
      </AnimatedPage>
    </>
  );
}
