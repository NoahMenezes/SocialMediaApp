"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { PostCard } from "@/components/post-card"
import { Image as ImageIcon, Smile, Calendar, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"
import { AnimatePresence, motion } from "framer-motion"

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
  image?: string
}

const samplePosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Kritika",
      username: "KritikaSaini23",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kritika",
      verified: true,
    },
    content: "A person who knows HTML, CSS, and JS is a developer?",
    timestamp: "3h",
    likes: 74,
    comments: 101,
    reposts: 3,
  },
  {
    id: "2",
    author: {
      name: "aditii",
      username: "aditiiwt",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditii",
      verified: true,
    },
    content: "is your profile picture actually you?",
    timestamp: "Jan 1",
    likes: 150,
    comments: 203,
    reposts: 1,
  },
  {
    id: "3",
    author: {
      name: "NZ",
      username: "CodeByNZ",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NZ",
      verified: true,
    },
    content: "if we don't stop VIBE CODERS !!!......",
    timestamp: "2h",
    likes: 0,
    comments: 0,
    reposts: 0,
  },
]

export function PostsFeed({ user }: { user?: { name: string; email: string } | null }) {
  const [posts, setPosts] = useState(samplePosts)
  const [newPost, setNewPost] = useState("")
  const [activeTab, setActiveTab] = useState("for-you")

  const handleCreatePost = () => {
    if (newPost.trim() && user) {
      const post: Post = {
        id: (posts.length + 1).toString(),
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
      setPosts([post, ...posts])
      setNewPost("")
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
                      className="relative rounded-none border-b-0 text-muted-foreground data-[state=active]:text-foreground py-4 transition-colors hover:bg-muted/10"
                    >
                      <span className="relative z-10">{tab}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
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
                        {[ImageIcon,  Smile, Calendar].map((Icon, i) => (
                          <motion.button 
                             key={i} 
                             whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.1)" }}
                             whileTap={{ scale: 0.9 }}
                             className="p-2 rounded-full text-primary transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                          </motion.button>
                        ))}
                      </div>
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="rounded-full px-6 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50"
                      >
                        Post
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
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </AnimatePresence>
          </div>
    </>
  )
}
