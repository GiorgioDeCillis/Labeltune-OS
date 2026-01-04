'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Calendar, ChevronRight, Clock, Wallet } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    pay_rate: string;
    created_at: string;
}

interface ProjectQueueModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function ProjectQueueModal({ isOpen, onClose, userId }: ProjectQueueModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen && userId) {
            fetchAssignedProjects();
        }
    }, [isOpen, userId]);

    const fetchAssignedProjects = async () => {
        setLoading(true);
        // Query projects via project_assignees junction table
        const { data, error } = await supabase
            .from('project_assignees')
            .select(`
                project_id,
                projects:projects (*)
            `)
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error) {
            console.error('Error fetching assigned projects:', error);
        } else if (data) {
            // Flatten the structure
            const assignedProjects = data
                .map((item: any) => item.projects)
                .filter((p: any) => p !== null); // Filter out any nulls if join failed
            setProjects(assignedProjects);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#121212] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold">Project Queue</h2>
                                    <p className="text-sm text-muted-foreground">Your available projects in priority order</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <Folder className="w-8 h-8 text-muted-foreground opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-bold">No Projects Assigned</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                            You currently don't have any projects in your queue. Please check back later.
                                        </p>
                                    </div>
                                ) : (
                                    projects.map((project, index) => (
                                        <div key={project.id} className="glass-panel p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                                            <div className="flex gap-4 items-start">
                                                {/* Index Badge */}
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm text-muted-foreground border border-white/5">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-bold truncate pr-4">{project.name}</h3>
                                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                            <Wallet className="w-4 h-4 text-emerald-400" />
                                                            <span className="font-mono font-bold">{project.pay_rate || '$15.00/hr'}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                                        {project.description || "No description provided."}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                                            <span className={`px-2 py-0.5 rounded-full border ${project.status === 'active'
                                                                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                                                                : 'border-white/10'
                                                                }`}>
                                                                {project.status}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(project.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* We link to tasks page for labeling generally, or specific project page if needed */}
                                                        {/* Based on user request "list of projects", assuming they can click to "Start" in that project context */}
                                                        <Link href={`/dashboard/projects/${project.id}`}>
                                                            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                                                Open Project <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                                <button className="text-sm text-muted-foreground hover:text-white transition-colors">
                                    Refresh Queue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
