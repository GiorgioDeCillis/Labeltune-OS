import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, BarChart3 } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const userRole = user.user_metadata?.role || 'annotator';

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back to Labeltune OS.</p>
            </div>

            {userRole === 'pm' || userRole === 'admin' ? (
                <PMDashboard user={user} />
            ) : (
                <WorkerDashboard user={user} />
            )}
        </div>
    );
}

// Sub-components for different roles
function PMDashboard({ user }: { user: any }) {
    return (
        <div className="space-y-6">
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

function WorkerDashboard({ user }: { user: any }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Tasks Assigned" value="45" icon={Clock} />
                <StatCard title="Completed Today" value="12" icon={CheckCircle} />
                <StatCard title="Accuracy Score" value="98.5%" icon={BarChart3} />
            </div>

            <div className="glass-panel p-6 rounded-xl text-center py-12 space-y-4">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-primary">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Ready to work?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    You have 45 tasks waiting in your queue. Start labeling now to maintain your streak.
                </p>
                <Link href="/dashboard/tasks">
                    <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all">
                        Start Labeling
                    </button>
                </Link>
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
