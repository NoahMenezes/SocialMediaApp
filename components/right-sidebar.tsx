"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { useRouter, useSearchParams } from "next/navigation"

export function RightSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trends = [
    { category: "Technology · Trending", topic: "#NextJS", posts: "125K posts" },
    { category: "Trending in India", topic: "Twinkle", posts: "89.2K posts" },
    { category: "Business · Trending", topic: "AI Revolution", posts: "45.1K posts" },
    { category: "Sports · Trending", topic: "CricketWorldCup", posts: "210K posts" },
  ]

  const whoToFollow = [
    { name: "Guillermo Rauch", username: "rauchg", avatar: "https://github.com/rauchg.png", verified: true },
    { name: "Lee Robinson", username: "leeerob", avatar: "https://github.com/leerob.png", verified: true },
  ]

  return (
    <aside className="hidden lg:block w-80 xl:w-[600px] fixed top-0 right-0 h-screen py-3 px-4 space-y-4 overflow-y-auto no-scrollbar premium-glass border-l-0 flex-shrink-0 z-20">
      {/* Search */}
      <div className="relative group sticky top-0 z-10 bg-black pb-2">
        <Search className="absolute left-4 top-3 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
        <Input
          placeholder="Search"
          className="pl-12 bg-zinc-900 border-none rounded-full h-11 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
          defaultValue={searchParams.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e.currentTarget.value;
              router.push(value ? `/dashboard?q=${value}` : "/dashboard");
            }
          }}
        />
      </div>



      {/* Trends for you */}
      <div className="premium-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-xl font-bold text-white text-glow">Trends for you</h2>
        </div>
        <div className="flex flex-col">
          {trends.map((trend, i) => (
            <button key={i} className="px-4 py-3 hover:bg-white/[0.05] transition-colors text-left group">
              <div className="flex justify-between items-start">
                <span className="text-xs text-zinc-400 font-medium">{trend.category}</span>
                <MoreHorizontal className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white font-bold mt-0.5">{trend.topic}</p>
              <span className="text-xs text-zinc-500">{trend.posts}</span>
            </button>
          ))}
        </div>
        <button className="px-4 py-4 w-full text-left text-purple-400 hover:text-purple-300 hover:bg-white/[0.03] transition-colors text-sm font-medium">
          Show more
        </button>
      </div>

      {/* Who to follow */}
      <div className="premium-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-white">Who to follow</h2>
        </div>
        <div className="flex flex-col">
          {whoToFollow.map((user, i) => (
            <div key={i} className="px-4 py-3 hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-between group cursor-pointer hover:translate-x-1">
              <div className="flex gap-3 overflow-hidden">
                <Avatar className="w-10 h-10 border border-white/5 flex-shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-zinc-800 text-white font-bold">{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white truncate hover:underline">{user.name}</span>
                    {user.verified && (
                      <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-4 h-4 fill-white flex-shrink-0"><g><path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.45-1.99-4.44-4.44-4.44-.49 0-.96.08-1.4.23C14.05 1.93 12.68 1.05 11.1 1.05c-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.45 0-4.44 1.99-4.44 4.44 0 .49.08.96.23 1.4C.68 9.55-.2 10.92-.2 12.5c0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.45 1.99 4.44 4.44 4.44.49 0 .96-.08 1.4-.23 1.4 1.3 2.77 2.18 4.35 2.18 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.45 0 4.44-1.99 4.44-4.44 0-.49-.08-.96-.23-1.4 1.3-.71 2.18-2.08 2.18-3.66zm-8.22-3.13l-5.63 5.62-2.73-2.73L4.85 13.3l3.8 3.81L15.4 10.43l-1.12-1.06z"></path></g></svg>
                    )}
                  </div>
                  <span className="text-zinc-500 text-sm truncate">@{user.username}</span>
                </div>
              </div>
              <Button size="sm" className="bg-white text-black hover:bg-gray-100 rounded-full font-bold px-4 ml-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95">
                Follow
              </Button>
            </div>
          ))}
        </div>
        <button className="px-4 py-4 w-full text-left text-indigo-400 hover:bg-white/[0.03] transition-colors text-sm">
          Show more
        </button>
      </div>

      <div className="text-xs text-zinc-500 px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "More"].map(item => (
            <a key={item} href="#" className="hover:underline">{item}</a>
          ))}
        </div>
        <p>© 2026 Twinkle, Inc.</p>
      </div>
    </aside>
  )
}
