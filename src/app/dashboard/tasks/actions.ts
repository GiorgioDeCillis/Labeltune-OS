'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function claimTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { error } = await supabase
        .from('tasks')
        .update({
            assigned_to: user.id,
            status: 'in_progress'
        })
        .eq('id', taskId)
        .is('assigned_to', null); // Safety check to ensure it wasn't claimed by someone else

    if (error) {
        console.error('Error claiming task:', error);
        redirect('/dashboard/tasks?error=Failed to claim task');
    }

    revalidatePath('/dashboard/tasks');
    redirect(`/dashboard/tasks/${taskId}`);
}

export async function submitTask(taskId: string, labels: any, timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get project pay rate
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, projects(pay_rate)')
        .eq('id', taskId)
        .single();

    const projectsData = task?.projects as any;
    const payRate = parseFloat((Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0');
    // timeSpent is in seconds. payRate is usually per hour.
    // earnings = (timeSpent / 3600) * payRate
    const earnings = (timeSpent / 3600) * payRate;

    const { error } = await supabase
        .from('tasks')
        .update({
            labels,
            status: 'completed',
            annotator_time_spent: timeSpent,
            annotator_earnings: earnings
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error submitting task:', error);
        throw new Error('Failed to submit task');
    }

    revalidatePath(`/dashboard/tasks`);
    revalidatePath(`/dashboard/projects/${task?.project_id}/tasks`);
    return { success: true };
}

export async function archiveTask(projectId: string, taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { error } = await supabase
        .from('tasks')
        .update({ is_archived: true })
        .eq('id', taskId);

    if (error) {
        console.error('Error archiving task:', error);
        throw new Error('Failed to archive task');
    }

    revalidatePath(`/dashboard/projects/${projectId}/tasks`);
    return { success: true };
}
