'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveTask(taskId: string, finalLabels: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Perform the update
    // Update status to 'approved' and save any modifications to labels
    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'approved',
            labels: finalLabels,
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error approving task:', error);
        throw new Error('Failed to approve task');
    }

    revalidatePath('/dashboard/review');
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
