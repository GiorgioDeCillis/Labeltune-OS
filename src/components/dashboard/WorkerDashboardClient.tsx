'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, Wallet, Briefcase, Info } from 'lucide-react';
import ProjectQueueModal from '@/components/dashboard/ProjectQueueModal';
import { createClient } from '@/utils/supabase/client';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    pay_rate: string;
    created_at: string;
    category?: string;
}

export default function WorkerDashboardClient({ user, profile }: { user: any, profile: any }) {
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (user?.id) {
            fetchAssignedProjects();
        }
    }, [user?.id]);

    const fetchAssignedProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('project_assignees')
                .select(`
                    project_id,
                    projects:projects (*)
                `)
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (error) {
                console.error('Error fetching assigned projects:', error);
            } else if (data) {
                const assignedProjects = data
                    .map((item: any) => item.projects)
                    .filter((p: any) => p !== null);
                setProjects(assignedProjects);
            }
        } catch (error) {
            console.error('Error in fetchAssignedProjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeProject = projects[0];

    return (
        <div className="space-y-12">
            <ProjectQueueModal
                isOpen={isQueueOpen}
                onClose={() => setIsQueueOpen(false)}
                userId={user.id}
            />

            {/* Hero Profile Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold">{profile?.full_name?.[0]}</span>
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">{profile?.full_name}</h1>
                    <p className="text-lg text-white/60">{user.email}</p>
                </div>
            </div>

            {/* Current Project Card Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Current Project</h2>
                    <button
                        onClick={() => setIsQueueOpen(true)}
                        className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                    >
                        Project Queue <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Default placeholder or 'Primary' project could go here. 
                    For now, showing a state that encourages opening the queue if no single project is highlighted contextually.
                 */}
                {loading ? (
                    <div className="glass-panel p-12 rounded-2xl border-2 border-white/5 animate-pulse flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full mb-4"></div>
                        <div className="h-6 w-48 bg-white/10 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-white/10 rounded"></div>
                    </div>
                ) : activeProject ? (
                    <div className="group relative">
                        {/* Background Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>

                        <Link href={`/dashboard/projects/${activeProject.id}`} className="relative block">
                            <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-primary/40 transition-all cursor-pointer overflow-hidden overflow-hidden relative">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Briefcase className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                                                Active Project
                                            </div>
                                            {activeProject.category && (
                                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                                    {activeProject.category}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                                                {activeProject.name}
                                            </h3>
                                            <p className="text-white/60 text-lg line-clamp-2 max-w-2xl">
                                                {activeProject.description || "Start working on your tasks for this project."}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Briefcase className="w-4 h-4" />
                                                <span>Data Science</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Clock className="w-4 h-4" />
                                                <span>Started {new Date(activeProject.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center">
                                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-center gap-4 group-hover:border-primary/30 transition-all">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                                <Wallet className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Rate</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-white">
                                                        {activeProject.pay_rate?.split('/')[0] || '$15.00'}
                                                    </span>
                                                    <span className="text-sm text-white/40">/ hr</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-2xl border-2 border-white/5 hover:border-primary/20 transition-all text-center cursor-pointer group" onClick={() => setIsQueueOpen(true)}>
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                            <Wallet className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Start Labeling</h3>
                        <p className="text-muted-foreground">Check your project queue to start working on assigned tasks.</p>
                        <button className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-all">
                            Open Project Queue
                        </button>
                    </div>
                )}
            </div>

            {/* Skills / Courses Section (Note: User wanted 'Courses' hidden in sidebar, probably here too if sensitive, 
               but request said "un account...non può vedere...Courses", implying specific navigation. 
               The Dashboard widget might be fine, but I'll hide it to be safe as it links to the restricted page.) 
            */}
        </div>
    );
}
