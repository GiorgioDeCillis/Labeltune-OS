import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ReviewTaskRenderer } from '@/components/ReviewTaskRenderer';
import { TaskComponent } from '@/components/builder/types';
import { TaskTimerHeader } from '@/components/TaskTimerHeader';
import { ProjectGuidelinesLink } from '@/components/ProjectGuidelinesLink';
import { CopyableTaskId } from '@/components/CopyableTaskId';
import { CopyableId } from '@/components/CopyableId';

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
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold">
                                    REVIEW MODE
                                </span>
                                <h2 className="text-xl font-bold tracking-tight">{task.projects?.name}</h2>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <CopyableTaskId taskId={task.id} />
                                <span className="text-white/20">|</span>
                                {/* Annotator ID Display */}
                                {task.assigned_to && (
                                    <CopyableId label="Annotator ID" id={task.assigned_to} />
                                )}
                                <span className="text-white/20">|</span>
                                <ProjectGuidelinesLink guidelines={task.projects?.guidelines} label="Read Guidelines" />
                                <TaskTimerHeader
                                    initialTimeSpent={task.reviewer_time_spent || 0}
                                    maxTime={task.projects?.max_task_time}
                                    isReadOnly={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex justify-center min-h-[500px]">
                {/* Tool Panel - Centered (Review Mode) */}
                <div className="w-full flex flex-col">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>Review & Edit</span>
                    </h3>

                    <div className="relative">
                        {templateSchema.length > 0 ? (
                            <div>
                                <ReviewTaskRenderer
                                    schema={templateSchema}
                                    taskId={task.id}
                                    initialData={{ ...(typeof task.payload === 'string' ? JSON.parse(task.payload) : task.payload || {}), ...(typeof task.labels === 'string' ? JSON.parse(task.labels) : task.labels || {}) }}
                                    initialTimeSpent={task.reviewer_time_spent || 0}
                                    projectId={task.project_id}
                                    initialEarnings={task.reviewer_earnings || 0}
                                    taskStatus={task.status}
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
