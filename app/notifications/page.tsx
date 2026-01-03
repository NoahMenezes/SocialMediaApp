import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, UserPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  const notifications = [
    {
      id: 1,
      type: "like",
      actor: {
        name: "Kritika",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kritika",
      },
      content: "liked your post",
      time: "2m",
      read: false,
    },
    {
      id: 2,
      type: "follow",
      actor: {
        name: "Aditii",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditii",
      },
      content: "followed you",
      time: "1h",
      read: true,
    },
    {
      id: 3,
      type: "reply",
      actor: {
        name: "NZ",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NZ",
      },
      content: "replied: 'Totally agree!'",
      time: "3h",
      read: true,
    },
  ];

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
                <p className="text-sm font-bold hover:underline">{notification.actor.name}</p>
                <p className="text-sm text-muted-foreground">{notification.content}</p>
              </div>
              {notification.type === "reply" && (
                <p className="text-muted-foreground text-sm mt-1">{notification.content}</p>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                No notifications yet.
            </div>
        )}
      </div>
    </AppLayout>
  );
}
