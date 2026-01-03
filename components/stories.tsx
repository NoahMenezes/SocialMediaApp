"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

interface Story {
    id: string
    user: {
        name: string
        avatar: string
    }
    viewed: boolean
}

const MOCK_STORIES: Story[] = [
    { id: "1", user: { name: "Jane Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" }, viewed: false },
    { id: "2", user: { name: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" }, viewed: false },
    { id: "3", user: { name: "Alice Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" }, viewed: true },
    { id: "4", user: { name: "Bob Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" }, viewed: false },
    { id: "5", user: { name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" }, viewed: false },
    { id: "6", user: { name: "Mike Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" }, viewed: true },
]

export function Stories({ user }: { user?: { name: string, image?: string | null } | null }) {
    return (
        <div className="w-full border-b border-border/40 bg-background/50 backdrop-blur-sm pt-4 pb-2">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 p-4 pt-0">
                    {/* Create Story */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-background ring-2 ring-muted p-1">
                                <AvatarImage src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} className="rounded-full object-cover" />
                                <AvatarFallback>Me</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 border-2 border-background text-white">
                                <Plus className="h-3 w-3" />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Your story</span>
                    </motion.button>

                    {/* Friends' Stories */}
                    {MOCK_STORIES.map((story, i) => (
                        <motion.button
                            key={story.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className={`rounded-full p-[2px] ${story.viewed ? 'bg-muted' : 'bg-gradient-to-tr from-primary to-accent'}`}>
                                <Avatar className="h-16 w-16 border-2 border-background">
                                    <AvatarImage src={story.user.avatar} />
                                    <AvatarFallback>{story.user.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-xs text-muted-foreground w-16 truncate text-center">{story.user.name.split(' ')[0]}</span>
                        </motion.button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    )
}
