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
            project_id: data.project_id || null,
            is_uploaded: data.is_uploaded || false
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

    // Check if instruction is linked to a project
    const { data: instruction, error: fetchError } = await supabase
        .from('instructions')
        .select('project_id')
        .eq('id', id)
        .single();

    if (fetchError) throw new Error(fetchError.message);
    if (instruction?.project_id) {
        throw new Error('Cannot delete instruction set linked to a project');
    }

    const { error, count } = await supabase
        .from('instructions')
        .delete({ count: 'exact' })
        .eq('id', id);

    if (error) throw new Error(error.message);
    if (count === 0) throw new Error('Instruction set not found or permission denied');

    revalidatePath('/dashboard/instructions');
    return { success: true };
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

export async function getInstructionSets() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: instructionSets, error } = await supabase
        .from('instructions')
        .select('id, name, content, updated_at')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return instructionSets || [];
}
