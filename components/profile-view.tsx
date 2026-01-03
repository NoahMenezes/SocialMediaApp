"use client"

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, ArrowLeft, MoreHorizontal, Link as LinkIcon, MapPin, PenSquare } from "lucide-react";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { PostCard } from "@/components/post-card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProfileView({ 
  user, 
  sessionUser, 
  mappedPosts 
}: { 
  user: any, 
  sessionUser: any, 
  mappedPosts: any[] 
}) {
  const isOwnProfile = sessionUser?.id === user.id;

  return (
    <AppLayout user={sessionUser} className="border-x border-border/40">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 px-4 h-14 flex items-center gap-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold leading-tight">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{mappedPosts.length} posts</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Banner */}
        <div className="h-40 sm:h-52 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        </div>
        
        {/* Profile Info Section */}
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16 sm:-mt-24 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-full p-1 bg-background"
              >
                <Avatar className="w-28 h-28 sm:w-44 sm:h-44 border-4 border-background text-4xl shadow-2xl">
                  <AvatarImage src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="icon" className="rounded-full border-border/40 hover:bg-muted/50 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              {isOwnProfile ? (
                <EditProfileDialog user={user} />
              ) : (
                <Button className="rounded-full font-bold px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95">Follow</Button>
              )}
            </div>
          </div>

          <div className="mt-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {user.name}
                <span className="bg-primary text-primary-foreground rounded-full p-[2px] shadow-sm">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">@{user.username || user.name.replace(/\s+/g, '').toLowerCase()}</p>
            </div>
            
            <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap max-w-xl text-lg">
              {user.bio || "Crafting digital experiences and building the future of social networking. 🚀"}
            </div>
            
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/20">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-1.5 group cursor-pointer">
                <LinkIcon className="w-4 h-4" />
                <span className="text-primary group-hover:underline">github.com/{user.username || "user"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Jan 2024'}</span>
              </div>
            </div>
            
             <div className="flex items-center gap-8 pt-2">
               <div className="flex items-center gap-1.5 hover:underline decoration-muted-foreground cursor-pointer group">
                  <span className="font-bold text-foreground text-lg">248</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Following</span>
               </div>
               <div className="flex items-center gap-1.5 hover:underline decoration-muted-foreground cursor-pointer group">
                  <span className="font-bold text-foreground text-lg">14.2k</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Followers</span>
               </div>
            </div>
          </div>
        </div>
        
        {/* Tabs - Glassmorphism */}
        <div className="flex border-b border-border/40 sticky top-14 bg-background/90 backdrop-blur-xl z-20">
            <button className="flex-1 py-4 text-center font-bold relative group overflow-hidden">
              <span className="relative z-10">Posts</span>
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.3)]" 
              />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="flex-1 py-4 text-center text-muted-foreground hover:bg-muted/30 transition-all font-medium">Replies</button>
            <button className="flex-1 py-4 text-center text-muted-foreground hover:bg-muted/30 transition-all font-medium">Media</button>
            <button className="flex-1 py-4 text-center text-muted-foreground hover:bg-muted/30 transition-all font-medium">Likes</button>
        </div>
        
        {/* Posts Content */}
        <div className="divide-y divide-border/40">
            {mappedPosts.length > 0 ? (
                mappedPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                ))
            ) : (
                <div className="p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-tr from-muted/40 to-muted/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
                       <PenSquare className="w-12 h-12 text-muted-foreground/30 -rotate-3" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold tracking-tight">No posts yet</h3>
                      <p className="text-muted-foreground text-lg max-w-[300px] mx-auto leading-relaxed">
                        When {isOwnProfile ? "you post" : "they post"} something, it will show up here.
                      </p>
                    </div>
                    {isOwnProfile && (
                      <Button className="rounded-full px-10 h-12 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        Create your first post
                      </Button>
                    )}
                </div>
            )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
