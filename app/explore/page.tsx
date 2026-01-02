import { getCurrentUser } from "@/backend/actions/auth";
import { Sidebar } from "@/components/sidebar";

export default async function ExplorePage() {
  const user = await getCurrentUser();
  
  return (
    <div className="flex h-screen bg-background justify-center">
      <div className="flex w-full max-w-[1600px]">
        <Sidebar user={user} />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Explore</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
        </div>
      </div>
    </div>
  );
}
