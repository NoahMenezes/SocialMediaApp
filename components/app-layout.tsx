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
  user?: { name?: string | null; email?: string | null; image?: string | null; username?: string | null } | null;
  className?: string; // For additional styling on main content
}

export function AppLayout({ children, user, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black w-full relative overflow-x-hidden selection:bg-purple-500/30">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-[-20%] w-[700px] h-[700px] bg-purple-900/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob" />
        <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />
        {/* Subtle Warmth (Champagne) */}
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-orange-500/5 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="bg-noise" />

      {/* Content Layer */}
      <div className="flex relative z-10 justify-center min-h-screen">
        {/* Left Sidebar */}
        <Sidebar user={user} />

        {/* Main Content */}
        <main className={cn(
          "flex-1 max-w-[1000px] border-x border-white/5 min-h-screen flex flex-col bg-black/20 backdrop-blur-sm",
          "ml-20 xl:ml-[420px]", // Offset for Left Sidebar
          "lg:mr-80 xl:mr-[600px]", // Offset for Right Sidebar
          className
        )}>
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}