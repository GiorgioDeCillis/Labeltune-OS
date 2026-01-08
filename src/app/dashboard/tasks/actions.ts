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
            annotator_completed_at: new Date().toISOString(),
            reviewed_by: null,
            review_feedback: null
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Functionally similar to skip, but specifically for expiration
    // We reset assignment and status so it goes back to the queue
    const { error } = await supabase
        .from('tasks')
        .update({
            assigned_to: null,
            status: 'pending',
            annotator_time_spent: 0,
            annotator_started_at: null
        })
        .eq('id', taskId)
        .eq('assigned_to', user.id);

    if (error) {
        console.error('Error expiring task:', error);
        throw new Error('Failed to expire task');
    }

    revalidatePath('/dashboard/tasks');
    return { success: true };
}

/**
 * Server-side cleanup of tasks that have stayed "in_progress" for too long.
 * Should be called before assigning new tasks or viewing project monitoring.
 */
export async function cleanupProjectTasks(projectId: string) {
    const supabase = await createClient();

    // Fetch project settings
    console.log(`[CLEANUP] Starting cleanup for project: ${projectId}`);
    // Fetch project settings
    const { data: project } = await supabase
        .from('projects')
        .select('name, max_task_time, extra_time_after_max, absolute_expiration_duration')
        .eq('id', projectId)
        .single();

    if (!project) {
        console.warn(`[CLEANUP] Project not found: ${projectId}`);
        return { success: false, error: 'Project not found' };
    }

    console.log(`[CLEANUP] Found project: ${project.name}`, project);

    const { max_task_time, extra_time_after_max, absolute_expiration_duration } = project;

    // If no expiration settings at all, skip cleanup
    if (!max_task_time && !absolute_expiration_duration) return { success: true, count: 0 };

    // Fetch in_progress tasks for this project
    const { data: tasks } = await supabase
        .from('tasks')
        .select('id, assigned_to, annotator_started_at, updated_at')
        .eq('project_id', projectId)
        .eq('status', 'in_progress');

    console.log(`[CLEANUP] Found ${tasks?.length || 0} in_progress tasks`);
    if (!tasks || tasks.length === 0) return { success: true, count: 0 };

    const now = new Date();
    const expiredTaskIds: string[] = [];

    for (const task of tasks) {
        if (!task.annotator_started_at) continue;

        const startedAt = new Date(task.annotator_started_at);
        const updatedAt = new Date(task.updated_at);
        const wallClockDiffSec = (now.getTime() - startedAt.getTime()) / 1000;
        const inactivitySec = (now.getTime() - updatedAt.getTime()) / 1000;

        let isExpired = false;

        // 1. Absolute Expiration Check (Hard limit since start - e.g. "you have 2 hours to finish this")
        if (absolute_expiration_duration && wallClockDiffSec > absolute_expiration_duration) {
            isExpired = true;
        }

        // 2. Task Time + Extra Time Check (Soft limit with absolute buffer)
        // If they have exceeded max_time + extra_time, we consider it expired
        // especially if they have stopped updating the timer.
        if (!isExpired && max_task_time) {
            const totalAllowedSec = max_task_time + (extra_time_after_max || 0);

            // If they are way over time (e.g. 2x the time) or over time + small buffer
            if (wallClockDiffSec > totalAllowedSec + 60) {
                isExpired = true;
            }
        }

        if (isExpired) {
            expiredTaskIds.push(task.id);
        }
    }

    if (expiredTaskIds.length > 0) {
        const { error } = await supabase
            .from('tasks')
            .update({
                assigned_to: null,
                status: 'pending',
                annotator_time_spent: 0,
                annotator_started_at: null,
                labels: null // Clear progress so next person starts fresh
            })
            .in('id', expiredTaskIds);

        if (error) {
            console.error(`Error during cleanup of ${expiredTaskIds.length} tasks for project ${projectId}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`Cleanup: Expired ${expiredTaskIds.length} stale tasks for project ${projectId}`);

        // Revalidate aggressively
        revalidatePath(`/dashboard/projects/${projectId}/tasks`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/history');

        // Revalidate layout to force refresh
        revalidatePath('/dashboard', 'layout');
    }

    return { success: true, count: expiredTaskIds.length };
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

export async function requeueTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify admin/pm
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    // Fetch the original task data
    const { data: originalTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (fetchError || !originalTask) {
        throw new Error('Original task not found');
    }

    // 1. Create a NEW task as a clone of the original (clean state)
    // We copy the project_id, payload, and priority, and link it via parent_task_id
    const { data: newTask, error: insertError } = await supabase
        .from('tasks')
        .insert({
            project_id: originalTask.project_id,
            payload: originalTask.payload,
            priority: originalTask.priority,
            status: 'pending',
            parent_task_id: taskId
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error creating re-queued task:', insertError);
        throw new Error('Failed to create new task');
    }

    // 2. Update the ORIGINAL task status to 'rejected_requeued'
    // This preserves all labels, earnings, time spent, etc.
    const { error: updateError } = await supabase
        .from('tasks')
        .update({
            status: 'rejected_requeued'
        })
        .eq('id', taskId);

    if (updateError) {
        console.error('Error updating original task status:', updateError);
        throw new Error('Failed to update original task status');
    }

    // Revalidate paths to reflect changes
    revalidatePath('/dashboard/projects', 'layout');
    revalidatePath(`/dashboard/projects/${originalTask.project_id}/tasks`);

    return { success: true, newTaskId: newTask.id };
}

