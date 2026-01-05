'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveTask(taskId: string, finalLabels: any, rating: number, timeSpent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get project pay rate (reviewer pay rate?)
    // For now using the same project pay rate or a separate reviewer rate if it existed.
    // The requirement just says "paga oraria del progetto".
    const { data: task } = await supabase
        .from('tasks')
        .select('project_id, projects(pay_rate)')
        .eq('id', taskId)
        .single();

    const projectsData = task?.projects as any;
    const payRate = parseFloat((Array.isArray(projectsData) ? projectsData[0]?.pay_rate : projectsData?.pay_rate) || '0');
    // Reviewer earnings - might be different but let's assume same for now or a fraction.
    // User said "guadagno del reviewer sulla base del tempo trascorso sulla task e paga oraria del progetto".
    const earnings = (timeSpent / 3600) * payRate;

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'approved',
            labels: finalLabels,
            reviewed_by: user.id,
            review_rating: rating,
            reviewer_time_spent: timeSpent,
            reviewer_earnings: earnings
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error approving task:', error);
        throw new Error('Failed to approve task');
    }

    revalidatePath('/dashboard/review');
    revalidatePath(`/dashboard/projects/${task?.project_id}/tasks`);
    redirect('/dashboard/review');
}

export async function rejectTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Rejecting means sending it back to the pool
    // Status -> 'pending' (or whatever the initial status is, usually 'pending' or 'active'?) 
    // Let's check the schema... usually 'pending' means available.
    // Also clear assigned_to

    // Note: If we want to keep the "bad" labels for history, we should probably archive this task 
    // and create a new one, OR just clear the labels. 
    // The requirement says "like a new task to start over".
    // I'll reset it completely for MVP.

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'pending',
            assigned_to: null,
            labels: null // Clear previous work? Or keep it as reference? User said "start over". Clearing is safer to force rework.
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error rejecting task:', error);
        throw new Error('Failed to reject task');
    }

    revalidatePath('/dashboard/review');
    redirect('/dashboard/review');
}
