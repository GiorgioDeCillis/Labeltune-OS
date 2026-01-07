'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle,
    Clock,
    Star,
    MessageSquare,
    History as HistoryIcon,
    ChevronRight,
    Search,
    DollarSign,
    X
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskHistory {
    id: string;
    project_id: string;
    project_name: string;
    status: string;
    role: 'attempter' | 'reviewer';
    time_spent: number;
    earnings: number;
    review_rating: number | null;
    review_feedback: string | null;
    created_at: string;
    completed_at: string | null;
}

export default function HistoryClient({ user, profile }: { user: any, profile: any }) {
    const [tasks, setTasks] = useState<TaskHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState<TaskHistory | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user?.id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    projects (name)
                `)
                .or(`assigned_to.eq.${user.id},reviewed_by.eq.${user.id}`)
                .in('status', ['submitted', 'completed', 'approved', 'rejected'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedTasks = data.map((t: any) => {
                const isReviewer = t.reviewed_by === user.id;
                return {
                    id: t.id,
                    project_id: t.project_id,
                    project_name: t.projects?.name || 'Unknown Project',
                    status: t.status,
                    role: (isReviewer ? 'reviewer' : 'attempter') as 'attempter' | 'reviewer',
                    time_spent: isReviewer ? (t.reviewer_time_spent || 0) : (t.annotator_time_spent || 0),
                    earnings: isReviewer ? (t.reviewer_earnings || 0) : (t.annotator_earnings || 0),
                    review_rating: t.review_rating,
                    review_feedback: t.review_feedback,
                    created_at: t.created_at,
                    completed_at: t.updated_at
                };
            });

            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task =>
        task.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalCompleted: tasks.filter(t => t.status === 'submitted' || t.status === 'completed' || t.status === 'approved').length,
        totalEarnings: tasks.reduce((acc, t) => acc + t.earnings, 0),
        avgRating: tasks.filter(t => t.review_rating !== null).length > 0
            ? tasks.filter(t => t.review_rating !== null).reduce((acc, t) => acc + (t.review_rating || 0), 0) / tasks.filter(t => t.review_rating !== null).length
            : null
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <HistoryIcon className="w-8 h-8 text-primary" />
                        Work History
                    </h1>
                    <p className="text-white/60 mt-1">Review your past performance and feedback</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects or task ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Completed</p>
                        <h3 className="text-2xl font-bold text-white">{stats.totalCompleted}</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Earnings</p>
                        <h3 className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Avg. Quality Rating</p>
                        <h3 className="text-2xl font-bold text-white">
                            {stats.avgRating !== null ? stats.avgRating.toFixed(1) : 'N/A'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Project / Task ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Time Spent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Earnings</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Rating</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 mx-auto bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 mx-auto bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-8 mx-auto bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 ml-auto bg-white/5 rounded"></div></td>
                                    </tr>
                                ))
                            ) : filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                    {task.project_name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <RoleBadge role={task.role} />
                                                    <Link href={task.role === 'reviewer' ? `/dashboard/review/${task.id}` : `/dashboard/projects/${task.project_id}/tasks/${task.id}`} className="hover:text-primary transition-colors">
                                                        <span className="text-[10px] font-mono text-white/40">#{task.id}</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(task.time_spent)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-emerald-400">
                                                ${task.earnings.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {task.review_rating ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-bold text-white">{task.review_rating.toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-white/20">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {task.review_feedback ? (
                                                <button
                                                    onClick={() => setSelectedTask(task)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-primary hover:border-primary/30 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    View Feedback
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-white/20 uppercase">No Feedback</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <HistoryIcon className="w-8 h-8 text-white/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-white font-bold">No history found</p>
                                                <p className="text-sm text-white/40">You haven't completed any tasks yet.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTask(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg glass-panel overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Reviewer Feedback</h3>
                                        <p className="text-xs text-white/40">Task #{selectedTask.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Project</p>
                                            <p className="text-sm font-bold text-white">{selectedTask.project_name}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-w-[100px]">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Rating</p>
                                            <div className="flex items-center gap-1.5 text-yellow-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-lg font-black">{selectedTask.review_rating?.toFixed(1) || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 relative">
                                        <div className="absolute top-4 left-4 opacity-10">
                                            <MessageSquare className="w-12 h-12 text-primary" />
                                        </div>
                                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3 relative z-10">Feedback Content</p>
                                        <p className="text-white/80 italic leading-relaxed relative z-10">
                                            "{selectedTask.review_feedback}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                        <span className="text-white/40">Earnings Earned</span>
                                        <span className="text-emerald-400">${selectedTask.earnings.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                        <span className="text-white/40">Time Spent</span>
                                        <span className="text-white/80">{formatTime(selectedTask.time_spent)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                >
                                    Close Feedback
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        submitted: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Submitted' },
        completed: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Completed' },
        approved: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Approved' },
        rejected: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Rejected' },
    };

    const config = configs[status] || configs.completed;

    return (
        <span className={`px-2.5 py-1 rounded-full border ${config.bg} ${config.color} ${config.border} text-[10px] font-bold uppercase tracking-wider`}>
            {config.label}
        </span>
    );
}

function RoleBadge({ role }: { role: 'attempter' | 'reviewer' }) {
    if (role === 'reviewer') {
        return (
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-wider">
                Reviewer
            </span>
        );
    }
    return (
        <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
            Attempter
        </span>
    );
}
