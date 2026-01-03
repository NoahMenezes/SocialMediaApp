"use client"

import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, PenSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FadeIn, SlideIn } from "@/components/ui/fade-in"
import { signOut } from "next-auth/react"

export function Sidebar({ user }: { user?: { name: string; email: string; image?: string | null } | null }) {
  const pathname = usePathname()
  
  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Mail, label: "Messages", href: "/messages" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <aside className="fixed md:sticky top-0 left-0 h-screen w-20 xl:w-72 border-r border-border/50 bg-background/95 backdrop-blur z-50 flex flex-col items-center xl:items-stretch py-4 select-none">
      {/* Logo */}
      <SlideIn delay={0.1} className="px-2 xl:px-6 mb-2 xl:mb-6">
        <Link href="/" className="flex items-center justify-center xl:justify-start w-12 h-12 xl:w-auto xl:h-auto hover:bg-muted/50 rounded-full xl:rounded-none p-2 xl:p-0 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-sm font-bold text-white">X</span>
          </div>
        </Link>
      </SlideIn>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-2 xl:px-4 w-full">
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <SlideIn key={item.label} delay={0.1 + (i * 0.05)}>
              <Link
                href={item.href}
                className={`flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full transition-all duration-200 group ${
                  isActive 
                    ? "font-bold text-primary bg-primary/10" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className={`w-7 h-7 xl:w-6 xl:h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:block text-xl">{item.label}</span>
              </Link>
            </SlideIn>
          )
        })}
      </nav>

      {/* Post Button */}
      <div className="px-2 xl:px-4 py-4 w-full">
        <FadeIn delay={0.5}>
          <Link href="/#post-input" className="w-full">
            <Button className="w-12 h-12 xl:w-full xl:h-12 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95">
              <PenSquare className="w-6 h-6 xl:hidden" />
              <span className="hidden xl:block font-bold text-lg">Post</span>
            </Button>
          </Link>
        </FadeIn>
      </div>


      {/* User Profile */}
      {user ? (
        <div className="p-2 xl:p-4 mt-auto w-full">
          <Link href="/profile" className="w-full block">
            <button className="w-full flex items-center justify-center xl:justify-between gap-3 p-2 xl:px-4 xl:py-3 rounded-full hover:bg-muted/50 transition-all group">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden xl:block text-left min-w-0">
                  <p className="font-bold text-sm text-foreground truncate leading-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.name.replace(/\s+/g, '')}</p>
                </div>
              </div>
              <MoreHorizontal className="hidden xl:block w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </button>
          </Link>
        </div>
      ) : (

        <div className="p-2 xl:p-4 mt-auto w-full">
           <Link href="/login" className="flex items-center justify-center gap-2 p-3 text-muted-foreground hover:text-primary transition-colors">
              <LogOut className="w-6 h-6" />
           </Link>
        </div>
      )}
    </aside>
  )
}
