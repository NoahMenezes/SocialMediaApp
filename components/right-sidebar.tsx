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

          {/* Today's News */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Today's News</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                {
                  category: "Entertainment",
                  title: "Rajinikanth's Thalaivar 173 Teases Big Update Tomorrow",
                  posts: "14K posts",
                },
                {
                  category: "Reality TV",
                  title: "Bigg Boss Tamil Season 9 Erupts in Heated Car Task Clash",
                  posts: "3,402 posts",
                },
                {
                  category: "Technology",
                  title: "AI revolutionizes the way we code: The rise of Agentic AI",
                  posts: "222.9K posts",
                },
              ].map((news, index) => (
                <div key={index} className="group cursor-pointer hover:bg-muted/30 -mx-4 px-4 py-3 transition-colors rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        {news.category} 
                        <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" /> 
                        {news.posts}
                      </p>
                      <p className="text-sm font-semibold text-foreground leading-snug mt-1 group-hover:text-primary transition-colors">
                        {news.title}
                      </p>
                    </div>
                    <button className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* What's happening */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Trending Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="group cursor-pointer hover:bg-muted/30 -mx-4 px-4 py-3 transition-colors">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  #NextJS15
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Development • 52K posts</p>
              </div>
               <div className="group cursor-pointer hover:bg-muted/30 -mx-4 px-4 py-3 transition-colors">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  #WebDesign
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Design • 12K posts</p>
              </div>
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
