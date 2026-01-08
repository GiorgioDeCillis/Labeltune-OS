'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { InstructionSet, InstructionSection } from '@/types/manual-types';

export interface UnifiedInstructionItem {
    id: string;
    name: string;
    description: string | null;
    content: any;
    type: 'platform' | 'uploaded' | 'project' | 'course';
    project_id?: string | null;
    updated_at: string;
}

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
    revalidatePath('/dashboard/knowledge');
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
    revalidatePath(`/dashboard/knowledge/${id}`);
    revalidatePath('/dashboard/knowledge');
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

    revalidatePath('/dashboard/knowledge');
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
    return getUnifiedInstructions();
}

export async function getUnifiedInstructions(): Promise<UnifiedInstructionItem[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Fetch standalone instructions
    const { data: instructions, error: instError } = await supabase
        .from('instructions')
        .select('*')
        .order('created_at', { ascending: false });

    if (instError) throw new Error(instError.message);

    const mappedInstructions: UnifiedInstructionItem[] = (instructions || []).map(inst => ({
        id: inst.id,
        name: inst.name,
        description: inst.description,
        content: inst.content,
        type: inst.is_uploaded ? 'uploaded' : 'platform',
        project_id: inst.project_id,
        updated_at: inst.updated_at
    }));

    // 2. Fetch project guidelines
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id, name, description, guidelines, updated_at')
        .neq('status', 'draft');

    if (projError) console.error('Error fetching projects for guidelines:', projError);

    const projectInstructions: UnifiedInstructionItem[] = (projects || [])
        .filter(p => p.guidelines && p.guidelines !== '[]' && p.guidelines !== '')
        .map(p => {
            let content = p.guidelines;
            try {
                if (typeof content === 'string' && (content.startsWith('[') || content.startsWith('{'))) {
                    content = JSON.parse(content);
                }
            } catch (e) {
                // If parsing fails, treat as raw text
            }

            return {
                id: p.id,
                name: `Instructions: ${p.name}`,
                description: p.description,
                content: content,
                type: 'project',
                project_id: p.id,
                updated_at: p.updated_at
            };
        });

    // 3. Fetch courses and lessons
    const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select(`
            id, 
            title, 
            description, 
            updated_at,
            project_id,
            lessons (
                id,
                title,
                content,
                order
            )
        `)
        .order('created_at', { ascending: false });

    if (courseError) console.error('Error fetching courses for instructions:', courseError);

    const courseInstructions: UnifiedInstructionItem[] = (courses || []).map(c => {
        // Aggregate lesson content into InstructionSections
        const sections: InstructionSection[] = (c.lessons || [])
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((l: any) => ({
                id: l.id,
                title: l.title,
                content: l.content || ''
            }));

        return {
            id: c.id,
            name: `Course: ${c.title}`,
            description: c.description,
            content: sections,
            type: 'course',
            project_id: c.project_id,
            updated_at: c.updated_at
        };
    });

    return [...mappedInstructions, ...projectInstructions, ...courseInstructions].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}
