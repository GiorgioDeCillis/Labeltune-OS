import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { TaskMonitoringView } from '@/components/dashboard/TaskMonitoringView';
import { cleanupProjectTasks } from '@/app/dashboard/tasks/actions';

export default async function SingleTaskMonitoringPage({
    params
}: {
    params: Promise<{ id: string, taskId: string }>
}) {
    const { id: projectId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Cleanup stale tasks before fetching
    try {
        await cleanupProjectTasks(projectId);
    } catch (e) {
        console.error('Error during cleanup in SingleTaskMonitoringPage:', e);
    }

    // Fetch task with related project and profile data
    const { data: task, error } = await supabase
        .from('tasks')
        .select(`
            *,
            projects (*)
        `)
        .eq('id', taskId)
        .single();

    if (!task || error) {
        console.error('Error fetching task for monitoring:', error);
        notFound();
    }

    // Safety check: ensure task belongs to the project in the URL
    if (task.project_id !== projectId) {
        notFound();
    }

    // Fetch profiles for annotator and reviewer
    const userIds = [task.assigned_to, task.reviewed_by].filter(Boolean) as string[];
    let annotator = null;
    let reviewer = null;

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (profiles) {
            annotator = profiles.find(p => p.id === task.assigned_to) || null;
            reviewer = profiles.find(p => p.id === task.reviewed_by) || null;
        }
    }

    // Fetch current user's role
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Safety check: handle project join (if it comes back as an array)
    const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

    // Fetch child task if this task was re-queued
    const { data: childTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('parent_task_id', taskId)
        .maybeSingle();

    return (
        <TaskMonitoringView
            task={task}
            project={project}
            annotator={annotator}
            reviewer={reviewer}
            currentUserRole={currentUserProfile?.role || 'annotator'}
            childTaskId={childTask?.id}
        />
    );
}
