import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { getNotifications } from "@/backend/actions/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, UserPlus, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await getNotifications();

  return (
    <AppLayout user={user}>
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 p-4">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>
      <div className="divide-y divide-border/40">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
              !notification.read && "bg-primary/5"
            )}
          >
            <div className="mt-1">
              {notification.type === "like" && <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />}
              {notification.type === "follow" && <UserPlus className="w-5 h-5 text-primary fill-primary" />}
              {notification.type === "reply" && <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={notification.actor.avatar} />
                  <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="text-sm">
                        <span className="font-bold hover:underline cursor-pointer">{notification.actor.name}</span>
                        {" "}
                        <span className="text-muted-foreground">{notification.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
            <div className="p-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">No notifications yet</h3>
                    <p className="text-sm max-w-[200px] mx-auto">When people like your posts or follow you, you'll see it here.</p>
                </div>
            </div>
        )}
      </div>
    </AppLayout>
  );
}
