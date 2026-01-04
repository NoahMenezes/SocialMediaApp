"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Repeat2 } from "lucide-react"
import Link from "next/link"
import { toggleLike, addComment, toggleRepost } from "@/backend/actions/interactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    try {
      await toggleLike(post.id)
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(likeCount)
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newReposted = !reposted
    setReposted(newReposted)
    setRepostCount(prev => newReposted ? prev + 1 : prev - 1)
    try {
        await toggleRepost(post.id)
    } catch (error) {
        setReposted(!newReposted)
        setRepostCount(repostCount)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <Link href={`/profile/${post.author.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-12 w-12 border border-white/5">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-zinc-800 text-white font-bold">{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm truncate">
              <Link href={`/profile/${post.author.username}`} className="font-bold hover:underline text-white truncate max-w-[150px]">
                {post.author.name}
              </Link>
              {post.author.verified && (
                <div className="text-white fill-current w-4 h-4 flex-shrink-0">
                  <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-full h-full fill-white"><g><path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.45-1.99-4.44-4.44-4.44-.49 0-.96.08-1.4.23C14.05 1.93 12.68 1.05 11.1 1.05c-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.45 0-4.44 1.99-4.44 4.44 0 .49.08.96.23 1.4C.68 9.55-.2 10.92-.2 12.5c0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.45 1.99 4.44 4.44 4.44.49 0 .96-.08 1.4-.23 1.4 1.3 2.77 2.18 4.35 2.18 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.45 0 4.44-1.99 4.44-4.44 0-.49-.08-.96-.23-1.4 1.3-.71 2.18-2.08 2.18-3.66zm-8.22-3.13l-5.63 5.62-2.73-2.73L4.85 13.3l3.8 3.81L15.4 10.43l-1.12-1.06z"></path></g></svg>
                </div>
              )}
              <span className="text-muted-foreground truncate">@{post.author.username}</span>
              <span className="text-muted-foreground ml-1">· {post.timestamp}</span>
            </div>
            <button className="text-muted-foreground hover:bg-white/10 p-1.5 rounded-full transition-colors group/more">
              <MoreHorizontal className="w-4 h-4 group-hover/more:text-white" />
            </button>
          </div>

          {/* Post Text */}
          <p className="text-[15px] leading-normal text-zinc-100 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Post Image */}
          {post.image && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mt-3">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover max-h-[512px]"
                loading="lazy"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 max-w-md -ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowCommentInput(!showCommentInput) }}
              className="flex items-center gap-2 text-muted-foreground hover:text-indigo-400 group/btn transition-colors"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-indigo-400/10">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm">{post.comments}</span>
            </button>

            <button
              onClick={handleRepost}
              className={cn(
                "flex items-center gap-2 group/btn transition-colors",
                reposted ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500"
              )}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-emerald-500/10">
                <Repeat2 className={cn("w-[18px] h-[18px]", reposted && "stroke-3")} />
              </div>
              <span className="text-sm">{repostCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 group/btn transition-colors",
                liked ? "text-pink-600" : "text-muted-foreground hover:text-pink-600"
              )}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-pink-600/10">
                <Heart className={cn("w-[18px] h-[18px]", liked && "fill-current")} />
              </div>
              <span className="text-sm">{likeCount}</span>
            </button>

            <div className="flex items-center">
              <button className="text-muted-foreground hover:text-indigo-400 p-2 rounded-full hover:bg-indigo-400/10 transition-colors">
                <Share className="w-[18px] h-[18px]" />
              </button>
              <button className="text-muted-foreground hover:text-indigo-400 p-2 rounded-full hover:bg-indigo-400/10 transition-colors ml-2">
                <Bookmark className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Comment Input Appearance */}
          <AnimatePresence>
            {showCommentInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-3 items-center">
                  <Input
                    autoFocus
                    placeholder="Post your reply"
                    className="bg-transparent border border-white/10 rounded-full h-9 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="rounded-full bg-white text-black hover:bg-white/90 font-bold h-9 px-4"
                    disabled={!commentText.trim()}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!commentText.trim()) return;
                      try {
                        await addComment(post.id, commentText);
                        setCommentText("");
                        setShowCommentInput(false);
                        // Optimistically update comment count (optional, but good UX)
                        /* In a real app, you might want to update a local comments list or 
                           re-fetch post data. For now, we rely on the server validation 
                           (revalidatePath) to update the UI on next interaction/refresh 
                           or we can just increment locally if we track comment count in state. 
                        */
                        /* If we want to update the count locally: 
                           setCommentsCount(prev => prev + 1); 
                           (We would need a state for comments count too, similar to likes/reposts)
                        */
                      } catch (error) {
                        console.error("Failed to add comment:", error);
                      }
                    }}
                  >
                    Reply
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
