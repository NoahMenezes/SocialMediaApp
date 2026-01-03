"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Send, Search, MoreVertical, Phone, Video, Loader2, Mail } from "lucide-react"
import { Sidebar } from "./sidebar"
import { getConversations, getMessages, sendMessage } from "@/backend/actions/messages"
import { cn } from "@/lib/utils"

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
  } | null
  lastMessage: {
    content: string
    createdAt: Date
  } | null
}

export function MessageSection({ user: currentUser }: { user?: { id: string; name: string; email: string; image?: string | null } | null }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Fetch conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations()
        setConversations(data as any)
        if (data.length > 0) {
          setSelectedConversation(data[0].id)
        }
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
    const convId = selectedConversation;
    if (convId) {
      async function loadMessages() {
        setMessagesLoading(true)
        try {
          const data = await getMessages(convId as string)
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

  const handleSendMessage = async () => {
    if (inputValue.trim() && selectedConversation) {
      const content = inputValue.trim()
      setInputValue("")

      // Readily add to UI for instant feedback
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
        // Re-fetch messages or just let revalidation handle it if using something like SWR/React Query
        // For now, let's just refresh the message list
        const data = await getMessages(selectedConversation)
        setDisplayMessages(data as any)
      } catch (error) {
        console.error("Failed to send message", error)
      }
    }
  }

  const selectedConvData = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="flex h-screen bg-background justify-center overflow-hidden">
      <div className="flex w-full max-w-[1600px]">
        <Sidebar user={currentUser as any} />

        <div className="flex flex-1 gap-0 h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-border flex flex-col h-full bg-muted/5">
            {/* Header */}
            <div className="border-b border-border p-4 space-y-4">
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search Direct Messages"
                  className="pl-10 bg-muted/30 border-0 rounded-full text-sm placeholder:text-muted-foreground focus:bg-muted/50 transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 transition-all hover:bg-muted/30 text-left",
                      selectedConversation === conversation.id && "bg-muted/50 border-r-2 border-primary"
                    )}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-background">
                      <AvatarImage src={conversation.otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.otherUser?.name || "anon"}`} />
                      <AvatarFallback>{conversation.otherUser?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-foreground truncate">{conversation.otherUser?.name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground flex-shrink-0">
                          {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate italic">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <p className="font-medium">No messages</p>
                  <p className="text-xs">Start a conversation with someone!</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col bg-background h-full">
            {selectedConvData ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarImage src={selectedConvData.otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConvData.otherUser?.name || "anon"}`} />
                      <AvatarFallback>{selectedConvData.otherUser?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-foreground leading-none mb-1">
                        {selectedConvData.otherUser?.name}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
                  {messagesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : displayMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex gap-3 max-w-[80%]",
                        message.isOwn ? "self-end flex-row-reverse" : "self-start"
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-auto mb-1">
                        <AvatarImage src={message.isOwn ? currentUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}` : selectedConvData.otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConvData.otherUser?.name}`} />
                        <AvatarFallback>{message.isOwn ? currentUser?.name?.[0] : selectedConvData.otherUser?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "flex flex-col gap-1",
                        message.isOwn ? "items-end" : "items-start"
                      )}>
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words relative group",
                            message.isOwn
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                          )}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1 font-medium">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border">
                  <div className="flex gap-2 max-w-4xl mx-auto">
                    <Input
                      placeholder="Start a new message"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-muted/30 border-none rounded-2xl focus:ring-1 focus:ring-primary/20 h-11"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 w-11 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-2">
                   <Mail className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Select a message</h2>
                <p className="text-muted-foreground max-w-xs">
                  Choose from your existing conversations or start a new one to begin chatting.
                </p>
                <Button variant="outline" className="rounded-full mt-4">New Message</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

