import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ReviewPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Role check: Only admins/PMs/reviewers should see this
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role === 'annotator') {
        return (
            <div className="md:col-span-2 glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-white/10 mx-auto max-w-2xl mt-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold">Access Denied</h3>
                <p className="text-muted-foreground mb-6">You do not have permission to access the Review Dashboard.</p>
                <Link href="/dashboard">
                    <button className="text-primary hover:underline">Return to Dashboard</button>
                </Link>
            </div>
        );
    }

    // Fetch tasks waiting for review (status = 'completed')
    // In a real app, we might filter by project permissions
    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *,
            projects (
                name,
                type
            ),
            profiles:assigned_to (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Review Queue</h2>
                    <p className="text-muted-foreground">Validate completed tasks from annotators.</p>
                </div>
            </div>

            {(!tasks || tasks.length === 0) ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-white/10">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-bold">All caught up!</h3>
                    <p className="text-muted-foreground">There are no tasks pending review at the moment.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <ReviewTaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewTaskCard({ task }: { task: any }) {
    return (
        <div className="glass-panel p-6 rounded-xl hover:border-primary/50 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                    <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-yellow-500/30 text-yellow-400">
                    Pending Review
                </span>
            </div>

            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                {task.projects?.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 font-mono">ID: {task.id.slice(0, 8)}</p>

            <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs overflow-hidden">
                    {task.profiles?.avatar_url ? (
                        <img src={task.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        task.profiles?.full_name?.[0] || '?'
                    )}
                </div>
                <span className="text-sm text-muted-foreground">
                    Annotated by <span className="text-foreground">{task.profiles?.full_name || 'Unknown'}</span>
                </span>
            </div>

            <div className="mt-auto">
                <Link href={`/dashboard/review/${task.id}`}>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all font-medium flex items-center justify-center gap-2">
                        Start Review
                    </button>
                </Link>
            </div>
        </div>
    );
}
