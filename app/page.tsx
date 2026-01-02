import { PostsFeed } from "@/components/posts-feed";
import { getCurrentUser } from "@/backend/actions/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return <PostsFeed user={user} />;
}
