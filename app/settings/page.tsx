import { AppLayout } from "@/components/app-layout"
import { getCurrentUser } from "@/backend/actions/auth"

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const user = await getCurrentUser()

    return (
        <AppLayout user={user}>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings page functionality coming soon.</p>
            </div>
        </AppLayout>
    )
}
