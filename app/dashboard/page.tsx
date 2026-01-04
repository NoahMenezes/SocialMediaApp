import { auth } from "@/auth.config";
import { AppLayout } from "@/components/app-layout";
import { PostsFeed } from "@/components/posts-feed";
import { getPosts } from "@/backend/actions/posts";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const posts = await getPosts();

    return (
        <AppLayout user={session.user}>
            <PostsFeed user={session.user} initialPosts={posts as any} />
        </AppLayout>
    );
}
