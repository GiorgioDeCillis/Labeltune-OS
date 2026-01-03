import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { Task } from '@/types/manual-types';

export default async function TasksPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch tasks assigned to user
    const { data: assignedTasks } = await supabase
        .from('tasks')
        .select('*, projects(name, type)')
        .eq('assigned_to', user.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: true });

    // Fetch available tasks (unassigned) - Limit to 10 for now
    const { data: availableTasks } = await supabase
        .from('tasks')
        .select('*, projects(name, type)')
        .is('assigned_to', null)
        .limit(10);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Workspace</h2>
                <p className="text-muted-foreground">Manage your labeling queue.</p>
            </div>

            {/* Assigned Tasks Section */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-primary" />
                    In Progress
                </h3>
                {!assignedTasks?.length ? (
                    <div className="glass-panel p-8 rounded-xl text-center text-muted-foreground border-dashed border-2 border-white/5">
                        No tasks currently in progress. Pick one from the pool below!
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {assignedTasks.map((task: any) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </section>

            {/* Available Pool Section */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                    Available Pool
                </h3>
                {!availableTasks?.length ? (
                    <div className="glass-panel p-8 rounded-xl text-center text-muted-foreground">
                        No new tasks available at the moment. Check back later.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availableTasks.map((task: any) => (
                            <TaskCard key={task.id} task={task} isPool />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function TaskCard({ task, isPool = false }: { task: Task, isPool?: boolean }) {
    return (
        <div className="glass-panel p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground uppercase tracking-wider font-bold">
                    {task.projects?.type || 'Generic'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-muted-foreground'
                    }`}>
                    {task.status.replace('_', ' ')}
                </span>
            </div>

            <div>
                <h4 className="font-bold text-lg line-clamp-1">{task.projects?.name}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">ID: {task.id.slice(0, 8)}...</p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.created_at).toLocaleDateString()}
                </div>

                <Link href={`/dashboard/tasks/${task.id}`}>
                    <button className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${isPool
                            ? 'bg-white/10 hover:bg-white/20 text-foreground'
                            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                        }`}>
                        {isPool ? 'Preview' : 'Continue'}
                    </button>
                </Link>
            </div>
        </div>
    )
}
