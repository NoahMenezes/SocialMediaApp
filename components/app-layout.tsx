"use client";

import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Wait, RightSidebar was imported in posts-feed.tsx from "./right-sidebar". 
// I should check if components/right-sidebar.tsx exists.
// Yes, line 9 of posts-feed.tsx: import { RightSidebar } from "./right-sidebar"
// But list_dir of components showed "right-sidebar.tsx". So it's fine.

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  user?: { name: string; email: string; image?: string | null } | null;
  className?: string; // For additional styling on main content
}

export function AppLayout({ children, user, className }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background justify-center">
      <div className="w-full max-w-[1400px] flex justify-center xl:justify-between relative">
        {/* Left Sidebar */}
        <Sidebar user={user} />

        {/* Main Content */}
        <main className={cn("flex-1 max-w-[700px] w-full border-x border-border/40 min-h-screen flex flex-col", className)}>
            {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}

