import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { claimTask } from '../actions';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function TaskLabelingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: task } = await supabase
        .from('tasks')
        .select('*, projects(*)')
        .eq('id', id)
        .single();

    if (!task) notFound();

    const isAssignedToMe = task.assigned_to === user.id;
    const canClaim = !task.assigned_to;

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tasks" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight">{task.projects?.name}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground border border-white/5">
                                {task.projects?.type}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">Task ID: {task.id}</p>
                    </div>
                </div>

                {!isAssignedToMe && canClaim && (
                    <form action={claimTask.bind(null, task.id)}>
                        <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-pulse">
                            Claim Task
                        </button>
                    </form>
                )}

                {!isAssignedToMe && !canClaim && (
                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>View Only (Assigned to another user)</span>
                    </div>
                )}
            </div>

            {/* Workspace */}
            <div className="flex-1 grid md:grid-cols-3 gap-6 min-h-[500px]">
                {/* Data Panel */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Data</h3>
                    <div className="flex-1 bg-black/20 rounded-xl p-6 font-serif leading-relaxed text-lg border border-white/5 overflow-y-auto">
                        {/* Placeholder for dynamic content rendering */}
                        {task.data?.text || JSON.stringify(task.data, null, 2)}
                    </div>
                </div>

                {/* Tool Panel */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Labeling</h3>

                    <div className="flex-1 flex flex-col gap-4">
                        {task.projects?.type === 'text_classification' ? (
                            <TextClassificationInterface />
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                This task type ({task.projects?.type}) is not yet fully supported in the UI.
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                        <button disabled={!isAssignedToMe} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Submit & Next
                        </button>
                        <button disabled={!isAssignedToMe} className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TextClassificationInterface() {
    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select the sentiment of the text:</p>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 hover:border-primary/50 cursor-pointer transition-all">
                <input type="radio" name="sentiment" value="positive" className="w-4 h-4 accent-primary" />
                <span className="font-medium">Positive</span>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 hover:border-primary/50 cursor-pointer transition-all">
                <input type="radio" name="sentiment" value="neutral" className="w-4 h-4 accent-primary" />
                <span className="font-medium">Neutral</span>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 hover:border-primary/50 cursor-pointer transition-all">
                <input type="radio" name="sentiment" value="negative" className="w-4 h-4 accent-primary" />
                <span className="font-medium">Negative</span>
            </label>
        </div>
    )
}
