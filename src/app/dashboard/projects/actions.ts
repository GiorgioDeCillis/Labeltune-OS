'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const guidelines = formData.get('guidelines') as string;
    const pay_rate = formData.get('pay_rate') as string;

    const template_schema = formData.get('template_schema') as string;

    // 1. Check if user has an organization
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    let orgId = profile?.organization_id;

    // 2. If not, create one
    if (!orgId) {
        const orgName = `${user.user_metadata?.full_name || 'My'} Organization`;
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgName, slug: crypto.randomUUID() }) // Simple slug generation
            .select()
            .single();

        if (orgError) {
            console.error('Error creating org:', orgError);
            throw new Error('Failed to create organization');
        }

        orgId = newOrg.id;

        // Update profile
        await supabase
            .from('profiles')
            .upsert({ id: user.id, organization_id: orgId });
    }

    // 3. Create Project
    const { error } = await supabase
        .from('projects')
        .insert({
            name,
            description,
            type,
            guidelines,
            pay_rate,
            template_schema: template_schema ? JSON.parse(template_schema) : [],
            organization_id: orgId,
            status: 'active'
        });

    if (error) {
        console.error('Error creating project:', error);
        redirect('/dashboard/projects/new?error=Failed to create project');
    }

    revalidatePath('/dashboard/projects');
    redirect('/dashboard/projects');
}

export async function updateProject(id: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const guidelines = formData.get('guidelines') as string;
    const pay_rate = formData.get('pay_rate') as string;
    const status = formData.get('status') as string;

    const { error } = await supabase
        .from('projects')
        .update({
            name,
            description,
            type,
            guidelines,
            pay_rate,
            status
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating project:', error);
        redirect(`/dashboard/projects/${id}/edit?error=Failed to update project`);
    }

    revalidatePath(`/dashboard/projects/${id}`);
    redirect(`/dashboard/projects/${id}`);
}
