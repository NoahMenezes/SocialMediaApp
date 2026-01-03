"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "./sidebar"
import { RightSidebar } from "./right-sidebar"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Image as ImageIcon, Smile, Calendar, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"
import { AnimatePresence, motion } from "motion/react"
import { Card } from "@/components/ui/card"

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
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[1400px] flex justify-center xl:justify-between relative">
        {/* Left Sidebar */}
        <Sidebar user={user} />

        {/* Main Feed */}
        <main className="flex-1 max-w-[700px] w-full border-x border-border/40 min-h-screen pb-20">
          
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40">
             <div className="px-4 py-3 flex items-center justify-between">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Home</h2>
                <Sparkles className="w-5 h-5 text-primary" />
             </div>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-auto p-0">
                {["For you", "Following"].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab.toLowerCase().replace(" ", "-")} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground py-4 transition-all hover:bg-muted/10"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
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
                      <textarea
                        placeholder="What is happening?!"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full bg-transparent text-xl font-medium placeholder:text-muted-foreground/50 resize-none outline-none min-h-[50px] py-2"
                        rows={2}
                      />
                   </div>
                   
                   <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex gap-1 -ml-2">
                        {[ImageIcon,  Smile, Calendar].map((Icon, i) => (
                          <button key={i} className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                            <Icon className="w-5 h-5" />
                          </button>
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
          <div className="divide-y divide-border/40">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.article 
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 hover:bg-muted/5 transition-colors cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-foreground hover:underline cursor-pointer">{post.author.name}</span>
                          {post.author.verified && (
                             <div className="bg-primary text-white rounded-full p-[1px]">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                             </div>
                          )}
                          <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                          <span className="text-muted-foreground text-sm">·</span>
                          <span className="text-muted-foreground text-sm hover:underline hover:text-primary transition-colors">{post.timestamp}</span>
                        </div>
                        <button className="p-2 -mr-2 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[17px] mb-3">
                        {post.content}
                      </p>

                      {post.image && (
                         <div className="mb-3 rounded-2xl overflow-hidden border border-border/50 bg-muted/20">
                            <img src={post.image} alt="Post content" className="w-full hover:scale-105 transition-transform duration-500" />
                         </div>
                      )}

                      <div className="flex items-center justify-between max-w-md pt-1 -ml-2">
                        <ActionButton icon={MessageCircle} count={post.comments} color="blue" />
                        <ActionButton icon={Repeat2} count={post.reposts} color="green" />
                        <ActionButton icon={Heart} count={post.likes} color="red" />
                        <ActionButton icon={Share} color="blue" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, count, color }: { icon: any, count?: number, color?: "blue" | "green" | "red" }) {
    const colorClasses = {
        blue: "group-hover:text-sky-500 group-hover:bg-sky-500/10",
        green: "group-hover:text-emerald-500 group-hover:bg-emerald-500/10",
        red: "group-hover:text-rose-500 group-hover:bg-rose-500/10",
    }
    const colorClass = color ? colorClasses[color] : "group-hover:text-sky-500 group-hover:bg-sky-500/10"
    const textColorClass = color ? colorClass.split(" ")[0] : "group-hover:text-sky-500"

    return (
        <button className="flex items-center gap-1.5 group transition-all text-muted-foreground">
            <div className={`p-2 rounded-full transition-colors ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            {count !== undefined && (
                <span className={`text-sm transition-colors ${textColorClass}`}>
                    {count > 0 ? count : ""}
                </span>
            )}
        </button>
    )
}
