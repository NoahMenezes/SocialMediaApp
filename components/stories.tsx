"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

const MOCK_STORIES = [
    { id: "1", username: "Guillermo Rauch", avatar: "https://github.com/rauchg.png", viewed: false },
    { id: "2", username: "Lee Robinson", avatar: "https://github.com/leerob.png", viewed: false },
    { id: "3", username: "Delba de Oliveira", avatar: "https://github.com/delbaoliveira.png", viewed: true },
    { id: "4", username: "Lydia Hallie", avatar: "https://github.com/lydiahallie.png", viewed: false },
    { id: "5", username: "Shu Ding", avatar: "https://github.com/shuding.png", viewed: true },
    { id: "6", username: "Jared Palmer", avatar: "https://github.com/jaredpalmer.png", viewed: false },
    { id: "7", username: "Steven Tey", avatar: "https://github.com/steventey.png", viewed: false },
]

export function Stories({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } | null }) {
    return (
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar py-2">
            {/* Your Story */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-black ring-2 ring-zinc-800 transition-transform group-active:scale-95">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback className="bg-zinc-800 text-white font-bold">{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-0.5 border-2 border-black">
                        <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">Your Story</span>
            </div>

            {/* Others */}
            {MOCK_STORIES.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                    <div className={`rounded-full p-[2.5px] ${story.viewed ? 'bg-zinc-800' : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'}`}>
                        <Avatar className="h-[60px] w-[60px] border-2 border-black transition-transform group-active:scale-95">
                            <AvatarImage src={story.avatar} />
                            <AvatarFallback className="bg-zinc-800 text-white font-bold">{story.username[0]}</AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium truncate w-16 text-center">{story.username.split(' ')[0]}</span>
                </div>
            ))}
        </div>
    )
}
