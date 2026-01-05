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

    // Get project pay rate and max time
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, projects(pay_rate, max_task_time)')
        .eq('id', taskId)
        .single();

    const projectsData = task?.projects as any;
    const payRate = parseFloat((Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0');

    // Cap timeSpent if max_task_time is set
    const maxTime = (Array.isArray(projectsData) ? projectsData[0]?.max_task_time : projectsData?.max_task_time);
    const billableTime = maxTime ? Math.min(timeSpent, maxTime) : timeSpent;

    // earnings = (billableTime / 3600) * payRate
    const earnings = (billableTime / 3600) * payRate;

    const { error } = await supabase
        .from('tasks')
        .update({
            labels,
            annotator_labels: labels, // Save original work
            status: 'completed',
            annotator_time_spent: timeSpent, // Keep tracking real time spent
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

export async function skipTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { error } = await supabase
        .from('tasks')
        .update({
            assigned_to: null,
            status: 'pending',
            annotator_time_spent: 0
        })
        .eq('id', taskId)
        .eq('assigned_to', user.id);

    if (error) {
        console.error('Error skipping task:', error);
        throw new Error('Failed to skip task');
    }

    revalidatePath('/dashboard/tasks');
    redirect('/dashboard/tasks');
}

export async function expireTask(taskId: string) {
    // Functionally same as skip for now, but we might want to distinguish later
    return skipTask(taskId);
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

export async function updateTaskTimer(taskId: string, timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('tasks')
        .update({ annotator_time_spent: timeSpent })
        .eq('id', taskId)
        .eq('assigned_to', user.id); // Only allow update if assigned to user

    if (error) {
        console.error('Error updating task timer:', error);
        return { error: 'Failed to update timer' };
    }

    return { success: true };
}
