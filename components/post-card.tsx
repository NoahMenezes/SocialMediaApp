"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, MessageCircle, Repeat2, Heart, Share, Send } from "lucide-react"
import Link from "next/link"
import { toggleLike, toggleRepost, addComment } from "@/backend/actions/interactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ActionButtonProps {
  icon: any
  count?: number
  color?: "blue" | "green" | "red"
  onClick?: (e: React.MouseEvent) => void
  active?: boolean
}

function ActionButton({ icon: Icon, count, color, onClick, active }: ActionButtonProps) {
  const colorClasses = {
    blue: "group-hover:text-sky-500 group-hover:bg-sky-500/10",
    green: "group-hover:text-emerald-500 group-hover:bg-emerald-500/10",
    red: "group-hover:text-rose-500 group-hover:bg-rose-500/10",
  }
  const colorClass = color ? colorClasses[color] : "group-hover:text-sky-500 group-hover:bg-sky-500/10"
  const activeColorClass = active && color === "red" ? "text-rose-500" : active && color === "green" ? "text-emerald-500" : ""
  
  return (
    <motion.button 
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 group transition-all text-muted-foreground ${activeColorClass}`}
    >
      <div className={`p-2 rounded-full transition-colors relative ${colorClass}`}>
        <Icon className={`w-5 h-5 ${active ? "fill-current" : ""}`} />
        {active && color && (
           <motion.div
             layoutId={`active-${color}-${Date.now()}`}
             className="absolute inset-0 rounded-full bg-current opacity-10"
             transition={{ duration: 0.2 }}
           />
        )}
      </div>
      {count !== undefined && (
        <span className={`text-sm transition-colors group-hover:text-current ${activeColorClass}`}>
          {count > 0 ? count : ""}
        </span>
      )}
    </motion.button>
  )
}

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

export function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [reposted, setReposted] = useState(post.isReposted || false)
  const [repostCount, setRepostCount] = useState(post.reposts)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistic update
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    
    try {
      await toggleLike(post.id)
    } catch (error) {
      // Revert on error
      setLiked(liked)
      setLikeCount(likeCount)
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setReposted(!reposted)
    setRepostCount(prev => reposted ? prev - 1 : prev + 1)

    try {
      await toggleRepost(post.id)
    } catch (error) {
      setReposted(reposted)
      setRepostCount(repostCount)
    }
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await addComment(post.id, commentText)
      setCommentText("")
      setShowCommentInput(false)
    } catch (error) {
      console.error("Failed to add comment", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="p-4 hover:bg-muted/5 transition-colors cursor-pointer group border-b border-border/40"
    >
      <div className="flex gap-4">
        <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
          <Link href={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()}>
            <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="font-bold text-foreground hover:underline cursor-pointer">
                {post.author.name}
              </Link>

              {post.author.verified && (
                  <div className="bg-primary text-white rounded-full p-[1px]">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </div>
              )}
              <span className="text-muted-foreground text-sm">@{post.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm hover:underline hover:text-primary transition-colors">{post.timestamp}</span>
            </div>

            <motion.button 
              whileHover={{ rotate: 90 }}
              onClick={e => e.stopPropagation()}
              className="p-2 -mr-2 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>

          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[17px] mb-3">
            {post.content}
          </p>

          {post.image && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mb-3 rounded-2xl overflow-hidden border border-border/50 bg-muted/20"
              >
                <img src={post.image} alt="Post content" className="w-full" />
              </motion.div>
          )}

          <div className="flex items-center justify-between max-w-md pt-1 -ml-2">
            <ActionButton 
              icon={MessageCircle} 
              count={post.comments} 
              color="blue" 
              onClick={(e) => { e.stopPropagation(); setShowCommentInput(!showCommentInput) }} 
            />
            <ActionButton 
              icon={Repeat2} 
              count={repostCount} 
              color="green" 
              active={reposted}
              onClick={handleRepost}
            />
            <ActionButton 
              icon={Heart} 
              count={likeCount} 
              color="red" 
              active={liked}
              onClick={handleLike}
            />
            <ActionButton icon={Share} color="blue" onClick={e => e.stopPropagation()} />
          </div>

          <AnimatePresence>
            {showCommentInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="bg-muted/30 border-none rounded-full"
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    className="rounded-full shrink-0"
                    disabled={!commentText.trim() || isSubmitting}
                    onClick={handleCommentSubmit}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}

