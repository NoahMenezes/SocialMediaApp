import { PostsFeed } from "@/components/posts-feed";
import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { getPosts } from "@/backend/actions/posts";

export default async function Home() {
  const user = await getCurrentUser();
  const initialPosts = await getPosts();

  return (
    <AppLayout user={user}>
      <PostsFeed user={user} initialPosts={initialPosts} />
    </AppLayout>
  );
}
