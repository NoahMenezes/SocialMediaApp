import { auth } from "@/auth.config";
import { LandingPage } from "@/components/landing-page";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
