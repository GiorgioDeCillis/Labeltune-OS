import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import WorkerDashboardClient from '@/components/dashboard/WorkerDashboardClient';

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
            {userRole === 'client' ? (
                // This component is server side, but better to redirect or render ClientDashboard here
                redirect('/dashboard/client')
            ) : userRole === 'pm' || userRole === 'admin' ? (
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
                <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, {profile?.full_name?.split(' ')[0]}</h2>
                <p className="text-white/60">Project Manager Dashboard</p>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Projects" value="12" icon={BarChart3} />
                <StatCard title="Active Tasks" value="1,234" icon={Clock} />
                <StatCard title="Completed" value="89%" icon={CheckCircle} />
                <StatCard title="Team Velocity" value="24/hr" icon={BarChart3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

function WorkerDashboard({ user, profile }: { user: any, profile: any }) {
    return <WorkerDashboardClient user={user} profile={profile} />;
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
