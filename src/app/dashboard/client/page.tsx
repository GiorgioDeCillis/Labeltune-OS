import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { BarChart3, Clock, CheckCircle, Wallet, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { SpendChart } from '@/components/analytics/SpendChart';
import { QualityMetric } from '@/components/analytics/QualityMetric';

export default async function ClientDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'client' && profile?.role !== 'admin') {
        // redirect('/dashboard'); // Temporarily allow admin to see for dev
    }

    // --- Mock Data Calculation (Replace with real aggregations) ---
    // In a real app, you would fetch tasks grouped by project and sum up costs
    const totalSpend = "$12,450";
    const tasksCompleted = "8,932";
    const hoursLogged = "430 hrs";
    const qualityScore = "98.5%";

    // Fetch All Projects (simulating client's projects)
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Enterprise Overview</h2>
                <p className="text-muted-foreground">Monitor capabilities, spend, and quality metrics.</p>
            </div>

            {/* High-Level Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Spend" value={totalSpend} icon={Wallet} trend="+12% this month" trendUp={true} />
                <StatCard title="Tasks Delivered" value={tasksCompleted} icon={CheckCircle} trend="+540 this week" trendUp={true} />
                <StatCard title="Quality Score" value={qualityScore} icon={TrendingUp} trend="+0.2% vs last batch" trendUp={true} />
                <StatCard title="Active Annotators" value="24" icon={Users} trend="Scale on demand" trendUp={true} />
            </div>

            {/* Projects List with Progress */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Active Workstreams</h3>
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <table className="w-full text-lefts">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-muted-foreground">
                            <tr>
                                <th className="p-4 text-left">Project Name</th>
                                <th className="p-4 text-left">Type</th>
                                <th className="p-4 text-left">Progress</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {projects?.map((project) => (
                                <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold">{project.name}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{project.type}</td>
                                    <td className="p-4 w-1/3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                {/* Mock progress based on name length randomizer for demo */}
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(project.name.length * 5) % 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground">{(project.name.length * 5) % 100}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/dashboard/projects/${project.id}`}>
                                            <button className="text-sm font-bold text-primary hover:underline">
                                                View Report
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analytics Area */}
            <div className="grid md:grid-cols-2 gap-8">
                <SpendChart
                    total={totalSpend}
                    data={[
                        { label: 'Mon', value: 450 },
                        { label: 'Tue', value: 1200 },
                        { label: 'Wed', value: 890 },
                        { label: 'Thu', value: 1500 },
                        { label: 'Fri', value: 2100 },
                        { label: 'Sat', value: 800 },
                        { label: 'Sun', value: 400 },
                    ]}
                />

                <QualityMetric
                    label="Throughput / Agreement"
                    score={98.5}
                    trend={1.2}
                    data={[85, 88, 92, 90, 95, 96, 98, 99]}
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: any) {
    return (
        <div className="glass-panel p-6 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-sm font-medium uppercase tracking-wider">{title}</span>
                <Icon className="w-4 h-4 opacity-70" />
            </div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            <p className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                {trend}
            </p>
        </div>
    )
}
