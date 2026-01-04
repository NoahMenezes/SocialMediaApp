"use client"

import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Hash, Twitter, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null; username?: string | null } | null }) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Hash, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Mail, label: "Messages", href: "/messages" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: User, label: "Profile", href: `/profile/${user?.username || 'me'}` },
  ]

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 xl:w-[420px] premium-glass border-r-0 border-r-white/5 flex flex-col py-4 select-none overflow-y-auto no-scrollbar flex-shrink-0 z-20">
      {/* Logo */}
      <div className="px-4 mb-4 flex justify-center xl:justify-start">
        <Link href="/dashboard" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <Twitter className="w-8 h-8 text-white fill-current" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <div key={item.label} className="flex justify-center xl:justify-start">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-5 p-3 px-4 rounded-3xl transition-all duration-300 group hover:bg-white/10 w-fit xl:w-full",
                  isActive ? "bg-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/5" : "hover:scale-105"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-7 h-7 transition-all duration-300",
                      isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-white/80 group-hover:text-white"
                    )}
                  />
                  {isActive && <div className="absolute inset-0 bg-white/20 blur-lg rounded-full" />}
                </div>
                <span className={cn(
                  "hidden xl:block text-xl tracking-wide",
                  isActive ? "font-bold text-white text-glow" : "font-medium text-white/80 group-hover:text-white"
                )}>{item.label}</span>
              </Link>
            </div>
          )
        })}

        {/* Post Button */}
        <div className="pt-6 px-1">
          <Button className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg hidden xl:block shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/20 relative overflow-hidden group">
            <span className="relative z-10 text-glow">Post</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          <div className="xl:hidden flex justify-center">
            <Button size="icon" className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
              <PlusSquare className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </nav>

      {/* User Profile / More */}
      <div className="mt-auto px-2">
        <button className="w-full flex items-center justify-center xl:justify-between p-3 rounded-full transition-all hover:bg-white/10 group">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-zinc-800 text-white">{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col items-start leading-tight">
              <span className="font-bold text-white text-sm truncate max-w-[120px]">{user?.name || "User"}</span>
              <span className="text-muted-foreground text-xs truncate max-w-[120px]">@{user?.username || "username"}</span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
