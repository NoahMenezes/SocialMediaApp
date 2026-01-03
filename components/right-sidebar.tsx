"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MoreHorizontal } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function RightSidebar() {
  return (
    <aside className="hidden lg:block w-80 xl:w-96 sticky top-0 h-screen overflow-hidden pt-4 pb-8 px-4">
      <FadeIn delay={0.2}>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search"
              className="pl-10 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-background shadow-sm rounded-full text-foreground placeholder:text-muted-foreground h-11 transition-all"
            />
          </div>

          {/* Subscribe to Premium */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Subscribe to Premium</CardTitle>
              <CardDescription>
                Unlock exclusive features and support creators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Subscribe
              </Button>
            </CardContent>
          </Card>

          {/* Today's News - Placeholder for API data */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Today's News</CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Stay tuned for the latest updates.
            </CardContent>
          </Card>

          {/* Trending Now - Placeholder for API data */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Trending Now</CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
              Explore what's happening around the world.
            </CardContent>
          </Card>
          
          <div className="text-xs text-muted-foreground px-2">
            <a href="#" className="hover:underline">Terms of Service</a> · <a href="#" className="hover:underline">Privacy Policy</a> · <a href="#" className="hover:underline">Cookie Policy</a>
            <p className="mt-1">© 2026 Social Media App, Inc.</p>
          </div>
        </div>
      </FadeIn>
    </aside>
  )
}
