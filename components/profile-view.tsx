"use client"

import { useState, useRef } from "react";
import { AppLayout } from "@/components/app-layout";
import { updateProfileImage } from "@/backend/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, ArrowLeft, MoreHorizontal, Link as LinkIcon, MapPin } from "lucide-react";
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

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // specific max size (e.g. 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert("File size too large. Please choose an image under 4MB.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const result = await updateProfileImage(base64String);
        if (!result.success) {
          alert("Failed to update profile picture");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
       console.error(error);
       setIsUploading(false);
    }
  };

  return (
    <AppLayout user={sessionUser}>
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-white/5 px-4 h-14 flex items-center gap-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 -ml-2 text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold leading-tight text-white">{user.name}</h2>
          <p className="text-xs text-zinc-500">{mappedPosts.length} posts</p>
        </div>
      </div>

      <div className="bg-black">
        {/* Banner */}
        <div className="h-48 sm:h-52 bg-zinc-900 border-b border-white/5 relative">
          {user.headerImage && (
            <img src={user.headerImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Info Section */}
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16 sm:-mt-20 mb-4">
              <div className="rounded-full p-1 bg-black group relative">
                <Avatar 
                  className={`w-32 h-32 sm:w-36 sm:h-36 border-4 border-black ${isOwnProfile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={handleImageClick}
                >
                  <AvatarImage src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback className="bg-zinc-800 text-white text-3xl font-bold">{user.name[0]}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Change</span>
                  </div>
                )}
                <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/10 text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              {isOwnProfile ? (
                <EditProfileDialog user={user} />
              ) : (
                <Button className="rounded-full font-bold px-5 bg-white text-black hover:bg-white/90">Follow</Button>
              )}
            </div>
          </div>

          <div className="mt-2 space-y-4">
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {user.name}
                </h1>
                {user.verified && (
                  <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-5 h-5 fill-white"><g><path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.45-1.99-4.44-4.44-4.44-.49 0-.96.08-1.4.23C14.05 1.93 12.68 1.05 11.1 1.05c-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.45 0-4.44 1.99-4.44 4.44 0 .49.08.96.23 1.4C.68 9.55-.2 10.92-.2 12.5c0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.45 1.99 4.44 4.44 4.44.49 0 .96-.08 1.4-.23 1.4 1.3 2.77 2.18 4.35 2.18 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.45 0 4.44-1.99 4.44-4.44 0-.49-.08-.96-.23-1.4 1.3-.71 2.18-2.08 2.18-3.66zm-8.22-3.13l-5.63 5.62-2.73-2.73L4.85 13.3l3.8 3.81L15.4 10.43l-1.12-1.06z"></path></g></svg>
                )}
              </div>
              <p className="text-zinc-500">@{user.username || user.name.replace(/\s+/g, '').toLowerCase()}</p>
            </div>

            {user.bio && (
              <div className="text-white leading-normal whitespace-pre-wrap max-w-xl">
                {user.bio}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-zinc-500 text-sm">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1 text-indigo-400">
                  <LinkIcon className="w-4 h-4 text-zinc-500" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{user.website.replace(/^https?:\/\//, '')}</a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Jan 2024'}</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-sm">
              <button className="flex items-center gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-white">{user.followingCount || 0}</span>
                <span className="text-zinc-500">Following</span>
              </button>
              <button className="flex items-center gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-white">{user.followersCount || 0}</span>
                <span className="text-zinc-500">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 sticky top-14 bg-black/80 backdrop-blur-md z-20">
          <button className="flex-1 py-4 text-center text-white font-bold relative transition-colors hover:bg-white/5">
            Posts
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full" />
          </button>
          <button className="flex-1 py-4 text-center text-zinc-500 hover:bg-white/5 transition-colors font-medium">Replies</button>
          <button className="flex-1 py-4 text-center text-zinc-500 hover:bg-white/5 transition-colors font-medium">Highlights</button>
          <button className="flex-1 py-4 text-center text-zinc-500 hover:bg-white/5 transition-colors font-medium">Media</button>
        </div>

        {/* Posts Content */}
        <div className="divide-y divide-white/5">
          {mappedPosts.length > 0 ? (
            mappedPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))
          ) : (
            <div className="p-12 text-center py-20">
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-zinc-500 max-w-xs mx-auto">
                {isOwnProfile ? "When you share posts, they'll show up here." : "This user hasn't shared any posts yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
