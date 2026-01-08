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
import { TaskMonitoringView } from '@/components/dashboard/TaskMonitoringView';

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

    // Fetch reviewer profile if different or to populate Monitoring View
    let reviewerProfile = null;
    if (task.reviewed_by) {
        // If current user is reviewer, we can use their data, or fetch profile logic identical for robustness
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', task.reviewed_by)
            .single();
        reviewerProfile = profile;
    }

    // Additional check for annotator avatar if not fetched above (HistoryClient fetches *, but here we manually select)
    if (task.assigned_to && !task.profiles?.avatar_url) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', task.assigned_to)
            .single();

        if (profile && task.profiles) {
            task.profiles.avatar_url = profile.avatar_url;
        }
    }

    const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;
    const templateSchema = (project?.template_schema as TaskComponent[]) || [];

    // If task is finalized, show Monitoring View (Read Only with Preview Header)
    if (['approved', 'completed', 'rejected'].includes(task.status)) {
        // We need to construct the annotator object expected by Monitoring View
        const annotatorObj = task.profiles ? {
            full_name: task.profiles.full_name,
            avatar_url: task.profiles.avatar_url
        } : null;

        return (
            <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col pt-6">
                <TaskMonitoringView
                    task={task}
                    project={project}
                    annotator={annotatorObj}
                    reviewer={reviewerProfile}
                    currentUserRole="reviewer" // This ensures Reviewer Metrics are shown
                    backUrl="/dashboard/history"
                />
            </div>
        );
    }

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
                                <h2 className="text-xl font-bold tracking-tight">{project?.name}</h2>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <CopyableTaskId taskId={task.id} />
                                <span className="text-white/20">|</span>
                                {/* Annotator ID Display */}
                                {task.assigned_to && (
                                    <CopyableId label="Annotator ID" id={task.assigned_to} />
                                )}
                                <span className="text-white/20">|</span>
                                <ProjectGuidelinesLink guidelines={project?.guidelines} label="Read Guidelines" />
                                <TaskTimerHeader
                                    key={task.id}
                                    initialTimeSpent={task.reviewer_time_spent || 0}
                                    maxTime={project?.max_task_time}
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
                                    key={task.id}
                                    schema={templateSchema}
                                    taskId={task.id}
                                    initialData={{
                                        ...(typeof task.payload === 'string' ? (JSON.parse(task.payload || '{}')) : task.payload || {}),
                                        ...(typeof task.labels === 'string' ? (JSON.parse(task.labels || '{}')) : task.labels || {})
                                    }}
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
