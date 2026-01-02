"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "./sidebar"
import { Search, Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Image as ImageIcon, Smile, Calendar } from "lucide-react"

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
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />

      <div className="flex flex-1 gap-0">
        {/* Main Feed */}
        <div className="flex-1 border-r border-border flex flex-col max-w-2xl">
          {/* Header */}
          <div className="border-b border-border p-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Home</h2>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              <button className="flex-1 py-3 border-b-2 border-primary text-foreground">For you</button>
              <button className="flex-1 py-3 text-muted-foreground hover:bg-muted/30 transition-colors">Following</button>
            </div>
          </div>

          {/* Create Post */}
          {user && (
            <div className="border-b border-border p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    placeholder="What's happening?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-lg resize-none outline-none min-h-[80px]"
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-bold"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="flex-1 overflow-y-auto">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-border p-4 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground hover:underline">{post.author.name}</span>
                      {post.author.verified && (
                        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                      )}
                      <span className="text-muted-foreground">@{post.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{post.timestamp}</span>
                      <button className="ml-auto p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post content" className="rounded-2xl w-full mb-3" />
                    )}
                    <div className="flex items-center justify-between max-w-md mt-2">
                      <button className="flex items-center gap-2 group">
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                          <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-primary">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                          <Repeat2 className="w-5 h-5 text-muted-foreground group-hover:text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-green-500">{post.reposts}</span>
                      </button>
                      <button className="flex items-center gap-2 group">
                        <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                          <Heart className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-red-500">{post.likes}</span>
                      </button>
                      <button className="group">
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                          <Share className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Search and Trends */}
        <div className="w-80 p-4 space-y-4 overflow-y-auto">
          {/* Search */}
          <div className="sticky top-0 bg-background pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-10 bg-muted/30 border-0 rounded-full text-foreground placeholder:text-muted-foreground focus:bg-muted/50"
              />
            </div>
          </div>

          {/* Subscribe to Premium */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xl font-bold text-foreground mb-2">Subscribe to Premium</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe to unlock new features and if eligible, receive a share of revenue.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold">
              Subscribe
            </Button>
          </div>

          {/* Today's News */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Today's News</h3>
            <div className="space-y-4">
              {[
                {
                  category: "Other",
                  title: "Rajinikanth's Thalaivar 173 Teases Big Update Tomorrow",
                  posts: "14K posts",
                },
                {
                  category: "Other",
                  title: "Bigg Boss Tamil Season 9 Erupts in Heated Car Task Clash",
                  posts: "3,402 posts",
                },
                {
                  category: "Other",
                  title: "Grok AI Faces Backlash for Generating Non-Consensual Explicit Images",
                  posts: "222.9K posts",
                },
              ].map((news, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{news.category} · {news.posts}</p>
                      <p className="text-sm font-semibold text-foreground group-hover:underline mt-1">
                        {news.title}
                      </p>
                    </div>
                    <button className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's happening */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xl font-bold text-foreground mb-4">What's happening</h3>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <p className="text-sm font-semibold text-foreground group-hover:underline">
                  Latest tech trends and updates
                </p>
                <p className="text-xs text-muted-foreground mt-1">Trending now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
