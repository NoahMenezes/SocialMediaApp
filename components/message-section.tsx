"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Send, Search, MoreVertical, Settings, Mail, Loader2, Info } from "lucide-react"
import { getConversations, getMessages, sendMessage } from "@/backend/actions/messages"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: Date
  isOwn: boolean
}

interface Conversation {
  id: string
  updatedAt: Date
  otherUser: {
    id: string
    name: string
    image: string | null
    username: string | null
    verified?: boolean
  } | null
  lastMessage: {
    content: string
    createdAt: Date
  } | null
}

export function MessageSection({ user: currentUser }: { user?: { id: string; name: string; email: string; image?: string | null; username?: string | null } | null }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations()
        setConversations(data as any)
        // Optionally select the first one on desktop
      } catch (error) {
        console.error("Failed to fetch conversations", error)
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  // Fetch messages when selectedConversation changes
  useEffect(() => {
    if (selectedConversation) {
      async function loadMessages() {
        setMessagesLoading(true)
        try {
          const data = await getMessages(selectedConversation!)
          setDisplayMessages(data as any)
        } catch (error) {
          console.error("Failed to fetch messages", error)
        } finally {
          setMessagesLoading(false)
        }
      }
      loadMessages()
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayMessages])

  const handleSendMessage = async () => {
    if (inputValue.trim() && selectedConversation) {
      const content = inputValue.trim()
      setInputValue("")

      // Add to UI immediately
      const tempMsg: Message = {
        id: "temp-" + Date.now(),
        senderId: currentUser?.id || "",
        content,
        createdAt: new Date(),
        isOwn: true
      }
      setDisplayMessages(prev => [...prev, tempMsg])

      try {
        await sendMessage(selectedConversation, content)
        // Refresh messages to get DB IDs and exact timestamps
        const data = await getMessages(selectedConversation)
        setDisplayMessages(data as any)
      } catch (error) {
        console.error("Failed to send message", error)
      }
    }
  }

  const selectedConvData = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="flex bg-black justify-center overflow-hidden min-h-screen">
      <div className="flex w-full max-w-[1400px]">
        {/* Reuse the redesigned Sidebar */}
        <Sidebar user={currentUser as any} />

        <div className="flex flex-1 border-r border-white/5">
          {/* Conversations List */}
          <div className={cn(
            "w-full md:w-[350px] xl:w-[400px] border-r border-white/5 flex flex-col h-screen",
            selectedConversation ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                    <Mail className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search Direct Messages"
                  className="pl-10 bg-zinc-900 border-none rounded-full h-11 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 transition-all hover:bg-white/[0.03] text-left",
                      selectedConversation === conv.id && "bg-white/[0.05] border-r-2 border-white"
                    )}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conv.otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser?.name || "anon"}`} />
                      <AvatarFallback className="bg-zinc-800 text-white font-bold">{conv.otherUser?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-1 truncate">
                          <span className="font-bold text-white truncate">{conv.otherUser?.name}</span>
                          {conv.otherUser?.verified && (
                            <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-4 h-4 fill-white"><g><path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.45-1.99-4.44-4.44-4.44-.49 0-.96.08-1.4.23C14.05 1.93 12.68 1.05 11.1 1.05c-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.45 0-4.44 1.99-4.44 4.44 0 .49.08.96.23 1.4C.68 9.55-.2 10.92-.2 12.5c0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.45 1.99 4.44 4.44 4.44.49 0 .96-.08 1.4-.23 1.4 1.3 2.77 2.18 4.35 2.18 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.45 0 4.44-1.99 4.44-4.44 0-.49-.08-.96-.23-1.4 1.3-.71 2.18-2.08 2.18-3.66zm-8.22-3.13l-5.63 5.62-2.73-2.73L4.85 13.3l3.8 3.81L15.4 10.43l-1.12-1.06z"></path></g></svg>
                          )}
                          <span className="text-zinc-500 text-sm">@{conv.otherUser?.username}</span>
                        </div>
                        <span className="text-xs text-zinc-500 ml-2">
                          {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                        </span>
                      </div>
                      <p className="text-[15px] text-zinc-500 truncate mt-0.5">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center text-zinc-500">
                  <h3 className="text-xl font-bold text-white mb-2">Welcome to your inbox!</h3>
                  <p className="text-sm">Drop a line, share posts and more with private conversations between you and others on Twinkle.</p>
                  <Button className="mt-6 bg-white text-black hover:bg-white/90 rounded-full font-bold px-8">Write a message</Button>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={cn(
            "flex-1 flex flex-col h-screen",
            !selectedConversation ? "hidden md:flex" : "flex"
          )}>
            {selectedConvData ? (
              <>
                <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden rounded-full text-white"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedConvData.otherUser?.image || ""} />
                        <AvatarFallback className="bg-zinc-800 text-white text-xs">{selectedConvData.otherUser?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-tight">
                        <p className="font-bold text-white text-[15px]">{selectedConvData.otherUser?.name}</p>
                        <p className="text-xs text-zinc-500">@{selectedConvData.otherUser?.username}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth bg-black"
                >
                  <div className="flex flex-col items-center py-8 border-b border-white/5 mb-4 group cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <Avatar className="w-16 h-16 mb-2">
                      <AvatarImage src={selectedConvData.otherUser?.image || ""} />
                      <AvatarFallback className="bg-zinc-800 text-white text-2xl font-bold">{selectedConvData.otherUser?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-white text-lg">{selectedConvData.otherUser?.name}</h3>
                    <p className="text-zinc-500">@{selectedConvData.otherUser?.username}</p>
                    <p className="text-zinc-400 text-sm mt-4 text-center max-w-sm px-4">
                      This is the beginning of your direct message history with @{selectedConvData.otherUser?.username}
                    </p>
                  </div>

                  {messagesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                    </div>
                  ) : displayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[75%] gap-1",
                        msg.isOwn ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-[15px] break-words",
                        msg.isOwn
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-zinc-800 text-white rounded-bl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[11px] text-zinc-500 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-white/5 bg-black">
                  <div className="flex items-center gap-1 bg-zinc-900 rounded-2xl px-2 py-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-indigo-400 hover:bg-indigo-400/10">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Input
                      placeholder="Start a new message"
                      className="bg-transparent border-none focus-visible:ring-0 text-white h-10"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      variant="ghost"
                      size="icon"
                      disabled={!inputValue.trim()}
                      className="rounded-full text-indigo-400 hover:bg-indigo-400/10 disabled:opacity-30"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-12">
                <h1 className="text-3xl font-bold text-white mb-2">Select a message</h1>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  Choose from your existing conversations, start a new one, or just keep swimming.
                </p>
                <Button className="mt-6 bg-white text-black hover:bg-white/90 rounded-full font-bold px-8">New message</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { ArrowLeft } from "lucide-react"
