"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { Sidebar } from "./sidebar"
import { Search, MoreVertical, Phone, Video } from "lucide-react"

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Creative Director",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Creative",
    lastMessage: "Love it! Just one more thing...",
    timestamp: "2:45 PM",
    unread: true,
  },
  {
    id: "2",
    name: "Design Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design",
    lastMessage: "Meeting at 3 PM confirmed",
    timestamp: "1:30 PM",
    unread: false,
  },
  {
    id: "3",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Thanks for the feedback!",
    timestamp: "Yesterday",
    unread: false,
  },
]

const messages: Message[] = [
  {
    id: "1",
    sender: "Creative Director",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Creative",
    content: "Hey! Are you here?",
    timestamp: "1:53 PM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    content: "Yeah...",
    timestamp: "1:53 PM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Creative Director",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Creative",
    content: "Great work on the slides! Love it! Just one more thing...",
    timestamp: "1:53 PM",
    isOwn: false,
  },
]

export function MessageSection({ user }: { user?: { name: string; email: string } | null }) {
  const [selectedConversation, setSelectedConversation] = useState("1")
  const [inputValue, setInputValue] = useState("")
  const [displayMessages, setDisplayMessages] = useState(messages)

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: (displayMessages.length + 1).toString(),
        sender: "You",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      }
      setDisplayMessages([...displayMessages, newMessage])
      setInputValue("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />

      <div className="flex flex-1 gap-0">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search Direct Messages"
                className="pl-10 bg-muted/30 border-0 rounded-full text-foreground placeholder:text-muted-foreground focus:bg-muted/50"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-muted/30 ${
                  selectedConversation === conversation.id ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                  <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground">{conversation.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                  {conversation.unread && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={conversations.find((c) => c.id === selectedConversation)?.avatar || "/placeholder.svg"}
                />
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {conversations.find((c) => c.id === selectedConversation)?.name}
                </p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <Video className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                  <AvatarFallback>{message.sender[0]}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-xs ${message.isOwn ? "items-end" : ""}`}>
                  <p className="text-xs text-muted-foreground px-3">{message.timestamp}</p>
                  <div
                    className={`px-4 py-2 rounded-2xl break-words ${
                      message.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/60 text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Start a new message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-muted/20 border-border text-foreground placeholder:text-muted-foreground rounded-full"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
