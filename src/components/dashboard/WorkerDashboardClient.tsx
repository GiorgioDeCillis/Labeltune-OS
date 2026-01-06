'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, Wallet, Briefcase, Info, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import ProjectQueueModal from '@/components/dashboard/ProjectQueueModal';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { startTasking } from '@/app/dashboard/projects/actions';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

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
    const [stats, setStats] = useState({
        totalTasks: 0,
        hoursWorked: 42, // Mocked for design
        avgRate: 15.50
    });
    const [onboardingInfo, setOnboardingInfo] = useState<{
        assessmentStatus: 'Completed' | 'Failed' | 'In Progress';
        firstIncompleteCourseId: string | null;
        onboardingStarted: boolean;
    }>({
        assessmentStatus: 'Completed',
        firstIncompleteCourseId: null,
        onboardingStarted: false
    });
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const supabase = createClient();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            showToast(error, 'error');
            // Clean up URL
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch assigned projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('project_assignees')
                .select(`
                    project_id,
                    projects:projects (*)
                `)
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (projectsError) console.error('Error fetching assigned projects:', projectsError);
            else if (projectsData) {
                const fetchedProjects = projectsData.map((item: any) => item.projects).filter((p: any) => p !== null);
                setProjects(fetchedProjects);

                if (fetchedProjects.length > 0) {
                    const activeProjectId = fetchedProjects[0].id;

                    // Fetch courses for this project
                    const { data: courses } = await supabase
                        .from('courses')
                        .select('*')
                        .eq('project_id', activeProjectId)
                        .order('created_at', { ascending: true });

                    if (courses && courses.length > 0) {
                        const { data: progress } = await supabase
                            .from('user_course_progress')
                            .select('status, course_id')
                            .eq('user_id', user.id)
                            .in('course_id', courses.map(c => c.id));

                        const progressMap = new Map(progress?.map(p => [p.course_id, p.status]));
                        const onboardingStarted = progress && progress.length > 0;

                        let hasFailed = false;
                        let allCompleted = true;
                        let firstIncompleteCourseId = null;

                        for (const course of courses) {
                            const status = progressMap.get(course.id);
                            if (status === 'failed') {
                                hasFailed = true;
                                break;
                            }
                            if (status !== 'completed') {
                                allCompleted = false;
                                if (!firstIncompleteCourseId) {
                                    firstIncompleteCourseId = course.id;
                                }
                            }
                        }

                        setOnboardingInfo({
                            assessmentStatus: hasFailed ? 'Failed' : (allCompleted ? 'Completed' : 'In Progress'),
                            firstIncompleteCourseId,
                            onboardingStarted
                        });
                    } else {
                        setOnboardingInfo({
                            assessmentStatus: 'Completed',
                            firstIncompleteCourseId: null,
                            onboardingStarted: false
                        });
                    }
                }
            }

            // Fetch total tasks completed
            const { count, error: tasksError } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_to', user.id)
                .eq('status', 'completed');

            if (!tasksError) {
                setStats(prev => ({ ...prev, totalTasks: count || 0 }));
            }

        } catch (error) {
            console.error('Error in fetchDashboardData:', error);
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
                                                <span className="mx-2 text-white/20">|</span>
                                                {onboardingInfo.assessmentStatus === 'Completed' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            startTasking(activeProject.id);
                                                        }}
                                                        className="text-primary hover:underline hover:text-primary/80 transition-colors"
                                                    >
                                                        Start Tasking
                                                    </button>
                                                ) : onboardingInfo.assessmentStatus === 'Failed' ? (
                                                    <span className="text-red-400 font-bold">Assessment Failed</span>
                                                ) : (
                                                    <Link
                                                        href={`/dashboard/courses/${onboardingInfo.firstIncompleteCourseId}`}
                                                        className="text-primary hover:underline hover:text-primary/80 transition-colors"
                                                    >
                                                        {onboardingInfo.onboardingStarted ? 'Continue Onboarding' : 'Start Onboarding'}
                                                    </Link>
                                                )}
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks.toString()}
                    icon={CheckCircle}
                />
                <StatCard
                    title="Hours Worked"
                    value={`${stats.hoursWorked}h`}
                    icon={Clock}
                />
                <StatCard
                    title="Avg. Rate"
                    value={`$${stats.avgRate.toFixed(2)}`}
                    icon={TrendingUp}
                />
            </div>

            {/* Earnings Gadget */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Earnings</h2>
                <div className="glass-panel p-8 rounded-2xl border border-white/5 relative group !overflow-visible">
                    <div className="flex flex-col md:flex-row gap-12 items-end">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-primary/80">
                                <Wallet className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Total Earnings</span>
                            </div>
                            <div className="text-5xl font-bold text-white tracking-tighter">$2,824</div>
                            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wide">Earnings (Aug 2025 - Jan 2026)</p>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-3 h-40 w-full group/chart relative">
                            {[
                                {
                                    m: 'Aug', v: 40, amount: 480, opacity: 0.2,
                                    projects: [{ n: 'RLHF Safety', a: 300 }, { n: 'Chat Eval', a: 180 }]
                                },
                                {
                                    m: 'Sep', v: 100, amount: 1200, opacity: 1, glow: true,
                                    projects: [{ n: 'RLHF Safety', a: 800 }, { n: 'Coding Gen', a: 400 }]
                                },
                                {
                                    m: 'Oct', v: 60, amount: 720, opacity: 0.4,
                                    projects: [{ n: 'RLHF Safety', a: 400 }, { n: 'Image Gen', a: 320 }]
                                },
                                {
                                    m: 'Nov', v: 75, amount: 900, opacity: 0.8, glow: true,
                                    projects: [{ n: 'Voice Design', a: 500 }, { n: 'RLHF Safety', a: 400 }]
                                },
                                {
                                    m: 'Dec', v: 50, amount: 600, opacity: 0.5,
                                    projects: [{ n: 'RLHF Safety', a: 350 }, { n: 'Creative', a: 250 }]
                                },
                                {
                                    m: 'Jan', v: 35, amount: 420, opacity: 0.3,
                                    projects: [{ n: 'RLHF Safety', a: 220 }, { n: 'Audio Lab', a: 200 }]
                                }
                            ].map((bar, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-2 h-full group/bar relative"
                                    onMouseEnter={() => setHoveredBar(i)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {hoveredBar === i && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                className="absolute bottom-full mb-4 z-50 pointer-events-none"
                                            >
                                                <div className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col min-w-[180px] gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{bar.m} Breakdown</span>
                                                        <span className="text-xl font-bold text-white tracking-tighter">${bar.amount}</span>
                                                    </div>

                                                    <div className="space-y-2 border-t border-white/5 pt-2">
                                                        {bar.projects.map((p, pi) => (
                                                            <div key={pi} className="flex justify-between items-center gap-4">
                                                                <span className="text-[10px] text-white/60 font-medium">{p.n}</span>
                                                                <span className="text-[10px] text-primary font-bold">${p.a}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0A0A0A]/95 rotate-45 border-r border-b border-white/10"></div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex-1 w-full bg-white/5 rounded-full relative overflow-hidden flex items-end cursor-pointer">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${bar.v}%` }}
                                            transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                                            className="w-full rounded-full relative transition-all duration-500 group-hover/bar:brightness-125 flex items-center justify-center overflow-hidden"
                                            style={{
                                                background: 'var(--primary)',
                                                opacity: bar.opacity
                                            }}
                                        >
                                            {bar.glow && (
                                                <div
                                                    className="absolute inset-0 blur-md rounded-full animate-pulse"
                                                    style={{ background: 'var(--primary)', opacity: 0.4 }}
                                                ></div>
                                            )}

                                            {/* Dynamic Value centered in fill */}
                                            <span
                                                className="text-[10px] font-black tracking-tighter text-white/90 relative z-10 whitespace-nowrap px-1"
                                                style={{ opacity: bar.v > 15 ? 1 : 0 }}
                                            >
                                                ${bar.amount}
                                            </span>
                                        </motion.div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300`}
                                        style={{ color: bar.glow ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }}
                                    >
                                        {bar.m}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills / Courses Section (Note: User wanted 'Courses' hidden in sidebar, probably here too if sensitive, 
               but request said "un account...non può vedere...Courses", implying specific navigation. 
               The Dashboard widget might be fine, but I'll hide it to be safe as it links to the restricted page.) 
            */}
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
    return (
        <div className="glass-panel p-6 rounded-xl space-y-2 border border-white/5 hover:border-white/10 transition-all group">
            <div
                className="flex items-center justify-between transition-colors duration-300"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        </div>
    );
}
