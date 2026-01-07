'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


export async function submitTask(taskId: string, labels: any, timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get project pay rate and max time
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, projects(pay_rate, max_task_time, payment_mode, pay_per_task)')
        .eq('id', taskId)
        .single();

    const projectsData = task?.projects as any;
    const rawRate = (Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0';

    // Robust parsing: extract numbers and handle decimal points
    const matches = rawRate.toString().match(/(\d+(?:[.,]\d+)?)/);
    const cleanRate = matches ? matches[0].replace(',', '.') : '0';
    const payRate = parseFloat(cleanRate) || 0;

    // Cap timeSpent if max_task_time is set
    const maxTime = (Array.isArray(projectsData) ? projectsData[0]?.max_task_time : projectsData?.max_task_time);
    const billableTime = maxTime ? Math.min(timeSpent, maxTime) : timeSpent;

    // Payment Mode Logic
    const paymentMode = (Array.isArray(projectsData) ? projectsData[0]?.payment_mode : projectsData?.payment_mode) || 'hourly';
    let earnings = 0;

    if (paymentMode === 'task') {
        const payPerTaskRaw = (Array.isArray(projectsData) ? projectsData[0]?.pay_per_task : projectsData?.pay_per_task) || '0';
        const matchesRate = payPerTaskRaw.toString().match(/(\d+(?:[.,]\d+)?)/);
        const cleanRate = matchesRate ? matchesRate[0].replace(',', '.') : '0';
        earnings = parseFloat(cleanRate) || 0;
    } else {
        earnings = (billableTime / 3600) * payRate;
    }

    const { error } = await supabase
        .from('tasks')
        .update({
            labels,
            annotator_labels: labels,
            status: 'submitted',
            annotator_time_spent: timeSpent, // Keep tracking real time spent
            annotator_earnings: earnings,
            annotator_completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error submitting task:', error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/tasks`);
    revalidatePath(`/dashboard/projects/${task?.project_id}/tasks`);

    return {
        success: true,
        data: {
            earnings,
            timeSpent: billableTime,
            projectId: task?.project_id
        }
    };
}

export async function skipTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

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
    // redirect('/dashboard/tasks'); // Client handles redirect
    return { success: true };
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

    // Get project pay rate for real-time earnings update
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, annotator_started_at, projects(pay_rate, max_task_time, payment_mode, pay_per_task)')
        .eq('id', taskId)
        .single();

    let earnings = 0;
    if (task?.projects) {
        const projectsData = task.projects as any;
        const rawRate = (Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0';
        const matches = rawRate.toString().match(/(\d+(?:[.,]\d+)?)/);
        const cleanRate = matches ? matches[0].replace(',', '.') : '0';
        const payRate = parseFloat(cleanRate) || 0;

        if (earnings === 0 && (projectsData.payment_mode === 'task' || projectsData[0]?.payment_mode === 'task')) {
            // For task mode, we might want to show estimated earnings or 0 until completion?
            // Usually for timer, we show 0 or the fixed amount. Let's show the fixed amount as "Pending Earnings"
            // But usually earnings are finalized on submit.
            // If we want to show it accruing, it doesn't make sense.
            // Let's set it to valid earnings so user sees what they WILL get.
            const payPerTaskRaw = (Array.isArray(projectsData) ? projectsData[0]?.pay_per_task : projectsData?.pay_per_task) || '0';
            const matchesRate = payPerTaskRaw.toString().match(/(\d+(?:[.,]\d+)?)/);
            const cleanRate = matchesRate ? matchesRate[0].replace(',', '.') : '0';
            earnings = parseFloat(cleanRate) || 0;
        } else {
            const maxTime = (Array.isArray(projectsData) ? projectsData[0]?.max_task_time : projectsData?.max_task_time);
            const billableTime = maxTime ? Math.min(timeSpent, maxTime) : timeSpent;
            earnings = (billableTime / 3600) * payRate;
        }
    }

    // Track starting time if not already set
    const updatePayload: any = {
        annotator_time_spent: timeSpent,
        annotator_earnings: earnings
    };

    if (!task?.annotator_started_at) {
        updatePayload.annotator_started_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .eq('assigned_to', user.id);

    if (error) {
        console.error('Error updating task timer:', error);
        return { error: 'Failed to update timer' };
    }

    return { success: true };
}
