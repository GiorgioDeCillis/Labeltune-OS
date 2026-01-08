'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Wallet, Clock, Home, ListTodo, Play } from 'lucide-react';
import Link from 'next/link';

interface TaskSubmissionSuccessProps {
    earnings: number;
    timeSpent: number;
    projectId: string;
    onDashboard: () => void;
    onNextTask: () => void;
}

export function TaskSubmissionSuccess({
    earnings,
    timeSpent,
    projectId,
    onDashboard,
    onNextTask
}: TaskSubmissionSuccessProps) {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-[#121212] border border-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
            >
                {/* Success Icon */}
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 relative z-10">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Task Submitted!</h2>
                <p className="text-muted-foreground mb-8 text-lg">Great work. Here's a summary of this task.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Earnings</span>
                        <span className="text-2xl font-bold text-white">€{earnings.toFixed(2)}</span>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time Spent</span>
                        <span className="text-2xl font-bold text-white">{formatTime(timeSpent)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                        onClick={onDashboard}
                        className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                        <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>

                    <button
                        onClick={onNextTask}
                        className="py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] group"
                    >
                        Next Task
                        <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
