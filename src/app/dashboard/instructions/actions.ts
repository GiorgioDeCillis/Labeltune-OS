'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { InstructionSet } from '@/types/manual-types';

export async function createInstructionSet(data: Partial<InstructionSet>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: instructionSet, error } = await supabase
        .from('instructions')
        .insert({
            name: data.name!,
            description: data.description,
            content: data.content,
            project_id: data.project_id || null
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/instructions');
    return instructionSet;
}

export async function updateInstructionSet(id: string, data: Partial<InstructionSet>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('instructions')
        .update({
            name: data.name,
            description: data.description,
            content: data.content,
            project_id: data.project_id
        })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/instructions/${id}`);
    revalidatePath('/dashboard/instructions');
}

export async function deleteInstructionSet(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('instructions')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/instructions');
}

export async function getInstructionSet(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: instructionSet, error } = await supabase
        .from('instructions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return instructionSet;
}
