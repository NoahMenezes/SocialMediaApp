import { PostsFeed } from "@/components/posts-feed";
import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <AppLayout user={user}>
      <PostsFeed user={user} />
    </AppLayout>
  );
}
