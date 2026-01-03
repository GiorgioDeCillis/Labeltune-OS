import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, BarChart3, ChevronRight, Wallet, BookOpen } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || 'annotator';

    return (
        <div className="space-y-8">
            {userRole === 'pm' || userRole === 'admin' ? (
                <PMDashboard user={user} profile={profile} />
            ) : (
                <WorkerDashboard user={user} profile={profile} />
            )}
        </div>
    );
}

// Sub-components for different roles
function PMDashboard({ user, profile }: { user: any, profile: any }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0]}</h2>
                <p className="text-muted-foreground">Project Manager Dashboard</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Projects" value="12" icon={BarChart3} />
                <StatCard title="Active Tasks" value="1,234" icon={Clock} />
                <StatCard title="Completed" value="89%" icon={CheckCircle} />
                <StatCard title="Team Velocity" value="24/hr" icon={BarChart3} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Recent Projects</h3>
                        <Link href="/dashboard/projects/new" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Plus className="w-4 h-4" /> New Project
                        </Link>
                    </div>
                    {/* Placeholder checks */}
                    <div className="space-y-2">
                        <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                            <span>Sentiment Analysis v3</span>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Active</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                            <span>Image Bounding Box Car</span>
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Paused</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

async function WorkerDashboard({ user, profile }: { user: any, profile: any }) {
    const supabase = await createClient();

    // Fetch "Current Project" - for now, just the latest active one
    // In future, this should be the one explicitly assigned or joined
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return (
        <div className="space-y-12">
            {/* Hero Profile Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold">{profile?.full_name?.[0]}</span>
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{profile?.full_name}</h1>
                    <p className="text-lg text-muted-foreground">{user.email}</p>
                </div>
            </div>

            {/* Current Project Card */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Current Project</h2>
                    <Link href="/dashboard/projects" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                        Project Queue <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {project ? (
                    <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-center">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">{project.name}</h3>
                                <p className="text-muted-foreground max-w-xl">{project.description || 'No description provided.'}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" /> {project.type}
                                    </span>
                                    {/* Mocked task availability for now */}
                                    <span className="flex items-center gap-1 text-red-400">
                                        <Clock className="w-4 h-4" /> No Task Available
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold flex items-center gap-2">
                                    <Wallet className="w-6 h-6 text-muted-foreground" />
                                    {project.pay_rate || '$15.00 / hr'}
                                </div>
                                <span className="text-xs text-muted-foreground">Estimated earnings</span>

                                <div className="mt-4 flex gap-3">
                                    <Link href={`/dashboard/projects/${project.id}`}>
                                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all">
                                            View Details
                                        </button>
                                    </Link>
                                    <Link href={`/dashboard/tasks`}>
                                        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                            Start Labeling
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-2xl border-dashed border-2 border-white/10 text-center">
                        <h3 className="text-xl font-bold mb-2">No Active Projects</h3>
                        <p className="text-muted-foreground">You are not assigned to any active projects.</p>
                    </div>
                )}
            </div>

            {/* Skills / Courses Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Skills & Training
                </h2>

                <div className="glass-panel p-0 rounded-2xl overflow-hidden">
                    <div className="p-8 bg-gradient-to-r from-background/50 to-transparent">
                        <h3 className="text-xl font-bold mb-2">Explore more skills</h3>
                        <p className="text-muted-foreground mb-6">Unlock new project opportunities by completing certification courses.</p>
                        <Link href="/dashboard/courses">
                            <button className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all">
                                Browse Courses
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
    return (
        <div className="glass-panel p-6 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-sm font-medium">{title}</span>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    )
}
