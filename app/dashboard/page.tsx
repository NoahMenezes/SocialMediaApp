import { auth } from "@/auth.config";
import { AppLayout } from "@/components/app-layout";
import { PostsFeed } from "@/components/posts-feed";
import { getPosts } from "@/backend/actions/posts";
import { redirect } from "next/navigation";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const resolvedSearchParams = await searchParams;
    const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
    const posts = await getPosts(undefined, query);

    return (
        <AppLayout user={session.user}>
            <PostsFeed user={session.user} initialPosts={posts as any} />
        </AppLayout>
    );
}
