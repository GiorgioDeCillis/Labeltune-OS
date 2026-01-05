import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { ReviewTaskRenderer } from '@/components/ReviewTaskRenderer';
import { TaskComponent } from '@/components/builder/types';

export default async function ReviewTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: rawTask } = await supabase
        .from('tasks')
        .select('*, projects(*)')
        .eq('id', id)
        .single();

    if (!rawTask) notFound();

    // Manually fetch annotator profile
    let task = rawTask;
    if (rawTask.assigned_to) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', rawTask.assigned_to)
            .single();

        if (profile) {
            task = { ...rawTask, profiles: profile };
        }
    }

    // Ideally check permissions here

    const templateSchema = (task.projects?.template_schema as TaskComponent[]) || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/review" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold">
                                REVIEW MODE
                            </span>
                            <h2 className="text-xl font-bold tracking-tight">{task.projects?.name}</h2>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            Task ID: {task.id} • Annotated by {task.profiles?.full_name || 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 grid md:grid-cols-3 gap-6 min-h-[500px]">
                {/* Data Panel */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Original Data</h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <Info className="w-3 h-3" />
                            Read Only
                        </div>
                    </div>
                    <div className="flex-1 bg-black/20 rounded-xl p-6 font-serif leading-relaxed text-lg border border-white/5 overflow-y-auto">
                        {/* Placeholder for dynamic content rendering */}
                        {typeof task.payload === 'string' ? task.payload : (task.payload as any)?.text || JSON.stringify(task.payload, null, 2)}
                    </div>
                </div>

                {/* Tool Panel (Review Mode) */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border-2 border-yellow-500/10">
                    <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>Review & Edit</span>
                    </h3>

                    <div className="flex-1 relative">
                        {templateSchema.length > 0 ? (
                            <div className="absolute inset-0">
                                <ReviewTaskRenderer
                                    schema={templateSchema}
                                    taskId={task.id}
                                    initialData={{ ...(typeof task.payload === 'string' ? JSON.parse(task.payload) : task.payload || {}), ...(typeof task.labels === 'string' ? JSON.parse(task.labels) : task.labels || {}) }}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                No template found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
