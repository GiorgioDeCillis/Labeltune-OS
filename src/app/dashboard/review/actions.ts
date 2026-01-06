'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveTask(taskId: string, finalLabels: any, rating: number, timeSpent: number, feedback?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Get project pay rate
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('project_id, projects(pay_rate)')
        .eq('id', taskId)
        .single();

    if (fetchError || !task) {
        console.error('Error fetching task for approval:', fetchError);
        return { success: false, error: 'Could not find task or project data' };
    }

    const projectsData = task.projects as any;
    const rawRate = (Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0';

    // Robust parsing: extract numbers and handle decimal points
    const matches = rawRate.toString().match(/(\d+(?:[.,]\d+)?)/);
    const cleanRate = matches ? matches[0].replace(',', '.') : '0';
    const payRate = parseFloat(cleanRate) || 0;

    // Reviewer earnings
    const earnings = (timeSpent / 3600) * payRate;

    // Update the task. 
    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'completed',
            labels: finalLabels,
            reviewed_by: user.id,
            review_rating: rating,
            review_feedback: feedback,
            reviewer_time_spent: timeSpent,
            reviewer_earnings: earnings,
            reviewer_completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error approving task:', error);
        return { success: false, error: `Database error: ${error.message}` };
    }

    try {
        revalidatePath('/dashboard/review');
        revalidatePath(`/dashboard/projects/${task?.project_id}/tasks`);
    } catch (e) {
        console.error('Revalidation error:', e);
    }

    return {
        success: true,
        data: {
            earnings,
            timeSpent,
            projectId: task?.project_id
        }
    };
}

export async function rejectTask(taskId: string, feedback?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'pending',
            assigned_to: null,
            review_feedback: feedback,
            labels: null
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error rejecting task:', error);
        return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath('/dashboard/review');
    return { success: true };
}

export async function updateReviewTimer(taskId: string, timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Get project pay rate for real-time earnings update
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, reviewer_started_at, projects(pay_rate)')
        .eq('id', taskId)
        .single();

    let earnings = 0;
    if (task?.projects) {
        const projectsData = task.projects as any;
        const rawRate = (Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0';
        const matches = rawRate.toString().match(/(\d+(?:[.,]\d+)?)/);
        const cleanRate = matches ? matches[0].replace(',', '.') : '0';
        const payRate = parseFloat(cleanRate) || 0;
        earnings = (timeSpent / 3600) * payRate;
    }

    // Track starting time if not already set
    const updatePayload: any = {
        reviewer_time_spent: timeSpent,
        reviewer_earnings: earnings
    };

    if (!task?.reviewer_started_at) {
        updatePayload.reviewer_started_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId);

    if (error) {
        console.error('Error updating review timer:', error);
        return { error: 'Failed to update timer' };
    }

    return { success: true };
}

export async function submitReviewerFeedback(taskId: string, rating: number, feedback: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Check if user is Admin or PM
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'pm')) {
        return { success: false, error: 'Only Admin or PM can submit reviewer feedback' };
    }

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'approved',
            reviewer_rating: rating,
            reviewer_feedback: feedback
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error submitting reviewer feedback:', error);
        return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath(`/dashboard/history`);
    revalidatePath(`/dashboard/projects`);

    return { success: true };
}
