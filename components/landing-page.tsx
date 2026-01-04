"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Twitter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-white/20">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-cyan-400"
                        >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="font-bold text-xl tracking-tight text-white">Twinkle</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                        <Link href="#pricing" className="hover:text-foreground transition-colors">Premium</Link>
                        <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full px-6">
                            <Link href="/signup">Sign up</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            Happening now
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Join the conversation. Connect with friends and the world around you.
                            Share your thoughts, photos, and moments in real-time.
                        </p>
                    </motion.div>

                    {/* Call to Action Input */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-center gap-4 justify-center max-w-md mx-auto w-full"
                    >
                        <div className="relative w-full">
                            <Input
                                type="email"
                                placeholder="Your email address"
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-12 rounded-xl pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-white/20"
                            />
                        </div>
                        <Button asChild className="w-full sm:w-auto h-12 rounded-xl px-8 bg-white text-black hover:bg-white/90 font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </motion.div>

                    {/* Social Proof / Stats */}
                    <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground/50">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-white/40" />
                            <span>Real-time updates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-white/40" />
                            <span>Global community</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-white/40" />
                            <span>Secure & Private</span>
                        </div>
                    </div>
                </div>

                {/* Mockup Card at Bottom */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-20 relative w-full max-w-sm mx-auto perspective-1000"
                >
                    <div className="relative bg-black border border-white/10 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 overflow-hidden transform rotate-x-12 hover:rotate-x-0 transition-transform duration-500">
                        {/* Glow Effect */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

                        {/* Mock Tweet */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-4 w-24 bg-white/20 rounded" />
                                <div className="h-3 w-full bg-white/10 rounded" />
                                <div className="h-3 w-3/4 bg-white/10 rounded" />
                            </div>
                        </div>

                        <div className="mt-6 mb-2 h-40 w-full bg-white/5 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                            <span className="text-xs text-white/30 font-mono">IMG_2024.jpg</span>
                        </div>

                        <div className="flex justify-between mt-4 text-white/20">
                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                            <div className="w-4 h-4 bg-white/10 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
