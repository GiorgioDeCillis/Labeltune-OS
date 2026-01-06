import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TaskRenderer } from '@/components/TaskRenderer';
import { CopyableTaskId } from '@/components/CopyableTaskId';
import { TaskComponent } from '@/components/builder/types';
import { ProjectGuidelinesLink } from '@/components/ProjectGuidelinesLink';
import { TaskTimerHeader } from '@/components/TaskTimerHeader';

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
    const templateSchema = (task.projects?.template_schema as TaskComponent[]) || [];

    return (
        <div className="w-full mx-auto space-y-6 flex flex-col">
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
                        <div className="flex items-center gap-4 mt-1">
                            <CopyableTaskId taskId={task.id} />
                            <span className="text-white/20">|</span>
                            <ProjectGuidelinesLink guidelines={task.projects?.guidelines} label="Read Guidelines" />
                            <TaskTimerHeader
                                key={task.id}
                                initialTimeSpent={task.annotator_time_spent || 0}
                                maxTime={task.projects?.max_task_time}
                                isReadOnly={!isAssignedToMe}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex justify-center min-h-[500px]">
                {/* Tool Panel - Centered */}
                <div className="w-full flex flex-col">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Labeling</h3>

                    <div className="relative">
                        {templateSchema.length > 0 ? (
                            <div>
                                <TaskRenderer
                                    key={task.id}
                                    schema={templateSchema}
                                    taskId={task.id}
                                    initialData={{ ...(typeof task.payload === 'string' ? JSON.parse(task.payload) : task.payload || {}), ...(typeof task.labels === 'string' ? JSON.parse(task.labels) : task.labels || {}) }}
                                    isReadOnly={!isAssignedToMe}
                                    maxTime={task.projects?.max_task_time}
                                    initialTimeSpent={task.annotator_time_spent || 0}
                                    projectId={task.project_id}
                                    initialEarnings={task.annotator_earnings || 0}
                                    taskStatus={task.status}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-10 flex flex-col gap-2">
                                <AlertCircle className="w-8 h-8 mx-auto opacity-50" />
                                <p>No workflow template defined.</p>
                                <p className="text-xs opacity-50">Please ask the project manager to configure the builder.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
