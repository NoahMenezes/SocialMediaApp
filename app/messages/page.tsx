import { MessageSection } from "@/components/message-section";
import { getCurrentUser } from "@/backend/actions/auth";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  return <MessageSection user={user} />;
}
