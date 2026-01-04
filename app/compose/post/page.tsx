"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react"
import { createPost } from "@/backend/actions/posts"
import { AppLayout } from "@/components/app-layout"

export default function ComposePostPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            setImage(event.target?.result as string)
          }
          reader.readAsDataURL(blob)
          e.preventDefault() // Prevent pasting the file name text if any
        }
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !image) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("content", content)
    if (image) {
      formData.append("image", image)
    }

    const result = await createPost(formData)
    
    if (result.success) {
      router.push("/dashboard")
      router.refresh()
    } else {
      console.error(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-[600px] mx-auto border-x border-white/5">
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={(!content.trim() && !image) || isSubmitting}
            className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>

        <div className="p-4 flex gap-3">
           <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0" /> {/* Avatar Placeholder or fetch user */}
           <div className="flex-1 space-y-4">
              <Textarea 
                placeholder="What is happening?!" 
                className="bg-transparent border-none text-xl resize-none p-0 focus-visible:ring-0 min-h-[150px] placeholder:text-zinc-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                autoFocus
              />
              
              {image && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 mt-2">
                  <img src={image} alt="Preview" className="w-full max-h-[500px] object-contain bg-black" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              <div className="border-t border-white/5 py-3 pt-4 flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-indigo-400 hover:bg-indigo-400/10 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
           </div>
        </div>
    </div>
  )
}
