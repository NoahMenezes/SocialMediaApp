"use client"

import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar({ user }: { user?: { name: string; email: string } | null }) {
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
    <aside className="w-64 border-r border-border bg-background flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border/50">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">X</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors font-medium text-lg ${
                isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Post Button and User Profile */}
      <div className="border-t border-border/50 px-4 py-4 space-y-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-lg py-6">
          Compose
        </Button>

        {user && (
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full hover:bg-muted/50 transition-colors group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.name.replace(/\s+/g, '')}</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </button>
        )}
      </div>
    </aside>
  )
}
