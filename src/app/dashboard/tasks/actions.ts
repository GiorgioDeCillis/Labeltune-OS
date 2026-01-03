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
        return { error: 'Failed to claim task. It may have been taken.' };
    }

    revalidatePath('/dashboard/tasks');
    redirect(`/dashboard/tasks/${taskId}`);
}
