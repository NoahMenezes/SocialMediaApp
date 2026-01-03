"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { PostCard } from "@/components/post-card"
import { Image as ImageIcon, Smile, Calendar, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"
import { AnimatePresence, motion } from "framer-motion"
import { createPost } from "@/backend/actions/posts"

interface Post {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  reposts: number
  image?: string | null
}

export function PostsFeed({ 
  user, 
  initialPosts = [] 
}: { 
  user?: { id: string; name: string; email: string } | null;
  initialPosts?: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newPost, setNewPost] = useState("")
  const [activeTab, setActiveTab] = useState("for-you")
  const [isPosting, setIsPosting] = useState(false)

  // Synchronize with initialPosts from server
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleCreatePost = async () => {
    if (newPost.trim() && user && !isPosting) {
      setIsPosting(true)
      try {
        const created = await createPost(newPost)
        
        const optimisticPost: Post = {
          id: created.id,
          author: {
            name: user.name,
            username: user.name.replace(/\s+/g, ''),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
            verified: false,
          },
          content: newPost,
          timestamp: "now",
          likes: 0,
          comments: 0,
          reposts: 0,
        }
        
        setPosts([optimisticPost, ...posts])
        setNewPost("")
      } catch (error) {
        console.error("Failed to create post", error)
      } finally {
        setIsPosting(false)
      }
    }
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Home</h2>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-auto p-0">
            {["For you", "Following"].map((tab) => {
              const isActive = activeTab === tab.toLowerCase().replace(" ", "-")
              return (
                <TabsTrigger 
                  key={tab}
                  value={tab.toLowerCase().replace(" ", "-")} 
                  className="relative rounded-none border-b-0 text-muted-foreground data-[state=active]:text-foreground py-4 transition-colors hover:bg-muted/10 font-bold"
                >
                  <span className="relative z-10">{tab}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Create Post Card */}
      {user && (
        <div className="p-4 border-b border-border/40">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm hover:scale-105 transition-transform cursor-pointer">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="relative">
                <Textarea
                  id="post-input"
                  placeholder="What is happening?!"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full bg-transparent text-xl font-medium placeholder:text-muted-foreground/50 resize-none outline-none min-h-[50px] py-2 border-none focus-visible:ring-0 shadow-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex gap-1 -ml-2">
                  {[ImageIcon, Smile, Calendar].map((Icon, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full text-primary transition-colors hover:bg-primary/10"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || isPosting}
                  className="rounded-full px-6 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="divide-y divide-border/40 pb-20">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post as any} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

