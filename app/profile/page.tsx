import { getCurrentUser } from "@/backend/actions/auth";
import { Sidebar } from "@/components/sidebar";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Profile</h1>
          {user && (
            <div className="mt-4">
              <p className="text-lg text-foreground">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          )}
          <p className="text-muted-foreground mt-4">Full profile coming soon...</p>
        </div>
      </div>
    </div>
  );
}
