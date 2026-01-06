import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { TaskMonitoringView } from '@/components/dashboard/TaskMonitoringView';

export default async function SingleTaskMonitoringPage({
    params
}: {
    params: Promise<{ id: string, taskId: string }>
}) {
    const { id: projectId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

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

    return (
        <TaskMonitoringView
            task={task}
            project={task.projects}
            annotator={annotator}
            reviewer={reviewer}
            currentUserRole={currentUserProfile?.role || 'worker'}
        />
    );
}
