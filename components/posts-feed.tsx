"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PostCard } from "./post-card"

import { getPosts, createPost } from "@/backend/actions/posts"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Smile, Calendar, MapPin, Loader2 } from "lucide-react"

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
  isLiked?: boolean
  isReposted?: boolean
}

export function PostsFeed({
  user,
  initialPosts = []
}: {
  user?: { id?: string | null; name?: string | null; email?: string | null; image?: string | null; username?: string | null } | null;
  initialPosts?: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts as any)
  const [newPostContent, setNewPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPosts(initialPosts as any)
  }, [initialPosts])

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("content", newPostContent)

      const result = await createPost(formData)
      if (result.success) {
        setNewPostContent("")
        // Prepend new post locally for instant feedback
        if (result.post) {
          setPosts([result.post as any, ...posts])
        }
      }
    } catch (error) {
      console.error("Failed to create post", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-4">
        <h2 className="text-xl font-bold text-white">Home</h2>
      </div>

      {/* Create Post Area */}
      <div className="p-4 border-b border-white/5 flex gap-4">
        <Avatar className="h-12 w-12 border border-white/5 flex-shrink-0">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-zinc-800 text-white font-bold">{user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <textarea
            className="w-full bg-transparent border-none text-xl placeholder:text-zinc-600 focus:ring-0 resize-none min-h-[50px] pt-2 text-white"
            placeholder="What's happening?!"
            value={newPostContent}
            onChange={(e) => {
              setNewPostContent(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-1">
              {[ImageIcon, Smile, Calendar, MapPin].map((Icon, i) => (
                <button key={i} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            <Button
              onClick={handlePostSubmit}
              disabled={!newPostContent.trim() || isSubmitting}
              className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex flex-col flex-1 divide-y divide-white/5">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </AnimatePresence>

        {posts.length === 0 && !loading && (
          <div className="p-12 text-center space-y-4">
            <p className="text-zinc-500 text-lg">No posts yet. Be the first to start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  )
}
