'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cleanupProjectTasks } from '@/app/dashboard/tasks/actions';

export async function getProject(id: string) {
    const supabase = await createClient();
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return project;
}

export async function saveProjectDraft(formData: FormData, draftId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const guidelines = formData.get('guidelines') as string;
    const pay_rate = formData.get('pay_rate') as string;
    const template_schema = formData.get('template_schema') as string;
    const max_task_time_min = formData.get('max_task_time') ? Number(formData.get('max_task_time')) : null;
    const total_tasks = formData.get('total_tasks') ? Number(formData.get('total_tasks')) : null;
    const course_ids = formData.get('course_ids') as string;
    const extra_time_min = formData.get('extra_time_after_max') ? Number(formData.get('extra_time_after_max')) : 0;
    const review_time_min = formData.get('review_task_time') ? Number(formData.get('review_task_time')) : 30;
    const review_extra_min = formData.get('review_extra_time') ? Number(formData.get('review_extra_time')) : 0;
    const abs_expire_min = formData.get('absolute_expiration_duration') ? Number(formData.get('absolute_expiration_duration')) : null;
    const payment_mode = formData.get('payment_mode') as string || 'hourly';
    const pay_per_task = formData.get('pay_per_task') as string;
    const review_pay_per_task = formData.get('review_pay_per_task') as string;

    const max_task_time = max_task_time_min ? max_task_time_min * 60 : null;
    const extra_time_after_max = extra_time_min * 60;
    const review_task_time = review_time_min * 60;
    const review_extra_time = review_extra_min * 60;
    const absolute_expiration_duration = abs_expire_min ? abs_expire_min * 60 : null;

    // 1. Get/Create Organization
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    let orgId = profile?.organization_id;

    if (!orgId) {
        const orgName = `${user.user_metadata?.full_name || 'My'} Organization`;
        const { data: newOrg } = await supabase
            .from('organizations')
            .insert({ name: orgName, slug: crypto.randomUUID() })
            .select()
            .single();
        orgId = newOrg?.id;
        if (orgId) {
            await supabase.from('profiles').upsert({ id: user.id, organization_id: orgId });
        }
    }

    const projectData = {
        name,
        description,
        type,
        guidelines,
        pay_rate,
        template_schema: template_schema ? JSON.parse(template_schema) : [],
        organization_id: orgId,
        status: 'draft',
        max_task_time,
        total_tasks,
        extra_time_after_max,
        review_task_time,
        review_extra_time,
        absolute_expiration_duration,
        payment_mode,
        pay_per_task,
        review_pay_per_task
    };

    let project;
    if (draftId) {
        const { data, error } = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', draftId)
            .select()
            .single();
        if (error) throw error;
        project = data;
    } else {
        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();
        if (error) throw error;
        project = data;
    }

    // Link courses
    if (course_ids && project) {
        try {
            const courseIds = JSON.parse(course_ids);
            // First unlink
            await supabase.from('courses').update({ project_id: null }).eq('project_id', project.id);
            // Then link
            if (Array.isArray(courseIds) && courseIds.length > 0) {
                await supabase
                    .from('courses')
                    .update({ project_id: project.id })
                    .in('id', courseIds);
            }
        } catch (e) {
            console.error('Error linking courses in draft:', e);
        }
    }

    revalidatePath('/dashboard/projects');
    return project;
}

export async function createProject(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const draftId = formData.get('draft_id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const guidelines = formData.get('guidelines') as string;
    const pay_rate = formData.get('pay_rate') as string;

    const template_schema = formData.get('template_schema') as string;
    const max_task_time_min = formData.get('max_task_time') ? Number(formData.get('max_task_time')) : null;
    const total_tasks = formData.get('total_tasks') ? Number(formData.get('total_tasks')) : null;
    const extra_time_min = formData.get('extra_time_after_max') ? Number(formData.get('extra_time_after_max')) : 0;
    const review_time_min = formData.get('review_task_time') ? Number(formData.get('review_task_time')) : 30;
    const review_extra_min = formData.get('review_extra_time') ? Number(formData.get('review_extra_time')) : 0;
    const abs_expire_min = formData.get('absolute_expiration_duration') ? Number(formData.get('absolute_expiration_duration')) : null;
    const payment_mode = formData.get('payment_mode') as string || 'hourly';
    const pay_per_task = formData.get('pay_per_task') as string;
    const review_pay_per_task = formData.get('review_pay_per_task') as string;

    const max_task_time = max_task_time_min ? max_task_time_min * 60 : null;
    const extra_time_after_max = extra_time_min * 60;
    const review_task_time = review_time_min * 60;
    const review_extra_time = review_extra_min * 60;
    const absolute_expiration_duration = abs_expire_min ? abs_expire_min * 60 : null;

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

    const projectData = {
        name,
        description,
        type,
        guidelines,
        pay_rate,
        template_schema: template_schema ? JSON.parse(template_schema) : [],
        organization_id: orgId,
        status: 'active',
        max_task_time,
        total_tasks,
        extra_time_after_max,
        review_task_time,
        review_extra_time,
        absolute_expiration_duration,
        payment_mode,
        pay_per_task,
        review_pay_per_task
    };

    let project;
    if (draftId) {
        const { data, error } = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', draftId)
            .select()
            .single();
        if (error) {
            console.error('Error updating project from draft:', error);
            redirect('/dashboard/projects/new?error=Failed to update project from draft');
        }
        project = data;
    } else {
        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();
        if (error) {
            console.error('Error creating project:', error);
            redirect('/dashboard/projects/new?error=Failed to create project');
        }
        project = data;
    }

    const newProject = project;

    // 4. Link courses if any
    const selectedCourseIds = formData.get('course_ids') as string;
    if (selectedCourseIds && newProject) {
        try {
            const courseIds = JSON.parse(selectedCourseIds);
            // Unlink first for update case
            await supabase.from('courses').update({ project_id: null }).eq('project_id', newProject.id);
            if (Array.isArray(courseIds) && courseIds.length > 0) {
                await supabase
                    .from('courses')
                    .update({ project_id: newProject.id })
                    .in('id', courseIds);
            }
        } catch (e) {
            console.error('Error linking courses:', e);
        }
    }

    // 5. Create task records if total_tasks is specified (only if not already created)
    if (total_tasks && total_tasks > 0 && newProject) {
        // Check if tasks already exist for this project
        const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', newProject.id);

        if ((count || 0) === 0) {
            const tasksToInsert = Array.from({ length: total_tasks }, (_, i) => ({
                project_id: newProject.id,
                status: 'pending',
                payload: {},  // Placeholder - actual data will be uploaded separately
                assigned_to: null
            }));

            const { error: tasksError } = await supabase
                .from('tasks')
                .insert(tasksToInsert);

            if (tasksError) {
                console.error('Error creating tasks:', tasksError);
            }
        }
    }

    revalidatePath('/dashboard/projects');
    redirect('/dashboard/projects');
}
export async function deleteProjectDraft(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Non autorizzato');

    // 1. Verifica ruolo
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAuthorized = profile?.role === 'pm' || profile?.role === 'admin';
    if (!isAuthorized) throw new Error('Non autorizzato');

    // 2. Verifica che il progetto esista e sia una bozza
    const { data: project } = await supabase
        .from('projects')
        .select('name, status')
        .eq('id', projectId)
        .single();

    if (!project) throw new Error('Progetto non trovato');
    if (project.status !== 'draft') {
        throw new Error('Solo i progetti in stato bozza possono essere eliminati');
    }

    // 3. Pulizia dipendenze in ordine

    // a. Elimina assegnazioni team
    const { error: assigneesError } = await supabase
        .from('project_assignees')
        .delete()
        .eq('project_id', projectId);

    if (assigneesError) {
        console.error('Errore eliminazione assegnatari:', assigneesError);
    }

    // b. Elimina task associati
    const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

    if (tasksError) {
        console.error('Errore eliminazione task:', tasksError);
    }

    // c. Scollega i corsi
    const { error: coursesError } = await supabase
        .from('courses')
        .update({ project_id: null })
        .eq('project_id', projectId);

    if (coursesError) {
        console.error('Errore scollegamento corsi:', coursesError);
    }

    // 4. Elimina finalmente il progetto
    const { error: projectError, count } = await supabase
        .from('projects')
        .delete({ count: 'exact' })
        .eq('id', projectId);

    if (projectError) {
        console.error('Errore eliminazione progetto:', projectError);
        throw new Error(`Errore durante l'eliminazione: ${projectError.message}`);
    }

    if (!count || count === 0) {
        throw new Error('Il progetto non è stato eliminato. Verifica che esista e che tu abbia i permessi.');
    }

    revalidatePath('/dashboard/projects');
    return project.name;
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
    const max_task_time_min = formData.get('max_task_time') ? Number(formData.get('max_task_time')) : null;
    const total_tasks = formData.get('total_tasks') ? Number(formData.get('total_tasks')) : null;
    const extra_time_min = formData.get('extra_time_after_max') ? Number(formData.get('extra_time_after_max')) : 0;
    const review_time_min = formData.get('review_task_time') ? Number(formData.get('review_task_time')) : 30;
    const review_extra_min = formData.get('review_extra_time') ? Number(formData.get('review_extra_time')) : 0;
    const abs_expire_min = formData.get('absolute_expiration_duration') ? Number(formData.get('absolute_expiration_duration')) : null;
    const payment_mode = formData.get('payment_mode') as string || 'hourly';
    const pay_per_task = formData.get('pay_per_task') as string;
    const review_pay_per_task = formData.get('review_pay_per_task') as string;

    const max_task_time = max_task_time_min ? max_task_time_min * 60 : null;
    const extra_time_after_max = extra_time_min * 60;
    const review_task_time = review_time_min * 60;
    const review_extra_time = review_extra_min * 60;
    const absolute_expiration_duration = abs_expire_min ? abs_expire_min * 60 : null;

    const { error } = await supabase
        .from('projects')
        .update({
            name,
            description,
            type,
            guidelines,
            pay_rate,
            status,
            max_task_time,
            total_tasks,
            extra_time_after_max,
            review_task_time,
            review_extra_time,
            absolute_expiration_duration,
            payment_mode,
            pay_per_task,
            review_pay_per_task
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating project:', error);
        redirect(`/dashboard/projects/${id}/edit?error=Failed to update project`);
    }

    revalidatePath(`/dashboard/projects/${id}`);
    redirect(`/dashboard/projects/${id}`);
}

export async function updateProjectInstructions(projectId: string, guidelines: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isPM = profile?.role === 'pm' || profile?.role === 'admin';
    if (!isPM) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('projects')
        .update({ guidelines })
        .eq('id', projectId);

    if (error) {
        console.error('Error updating instructions:', error);
        throw new Error('Failed to update instructions');
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function assignUserToProject(projectId: string, userId: string) {
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

    const { error } = await supabase
        .from('project_assignees')
        .insert({
            project_id: projectId,
            user_id: userId
        });

    if (error) {
        console.error('Error assigning user:', error);
        throw new Error('Failed to assign user');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function removeUserFromProject(projectId: string, userId: string) {
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

    const { error } = await supabase
        .from('project_assignees')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error removing user:', error);
        throw new Error('Failed to remove user');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function searchProfiles(query: string, tags: string[] = []) {
    const supabase = await createClient();

    let dbQuery = supabase
        .from('profiles')
        .select('*')
        .order('role');

    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,id.eq.${query}`);
    }

    if (tags && tags.length > 0) {
        dbQuery = dbQuery.contains('tags', tags);
    }

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error searching profiles:', error);
        return [];
    }

    return data;
}

export async function updateAssigneeStatus(projectId: string, userId: string, status: 'active' | 'paused') {
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

    const { error } = await supabase
        .from('project_assignees')
        .update({ status })
        .eq('project_id', projectId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating assignee status:', error);
        throw new Error('Failed to update status');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function updateProjectCourses(projectId: string, courseIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isPM = profile?.role === 'pm' || profile?.role === 'admin';
    if (!isPM) throw new Error('Unauthorized');

    // 1. Unlink all courses currently linked to this project
    await supabase
        .from('courses')
        .update({ project_id: null })
        .eq('project_id', projectId);

    // 2. Link newly selected courses
    if (courseIds.length > 0) {
        await supabase
            .from('courses')
            .update({ project_id: projectId })
            .in('id', courseIds);
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
}

export async function assignUsersToProject(projectId: string, userIds: string[]) {
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

    const assignments = userIds.map(userId => ({
        project_id: projectId,
        user_id: userId
    }));

    const { error } = await supabase
        .from('project_assignees')
        .insert(assignments);

    if (error) {
        console.error('Error assigning users:', error);
        throw new Error('Failed to assign users');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function removeUsersFromProject(projectId: string, userIds: string[]) {
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

    const { error } = await supabase
        .from('project_assignees')
        .delete()
        .eq('project_id', projectId)
        .in('user_id', userIds);

    if (error) {
        console.error('Error removing users:', error);
        throw new Error('Failed to remove users');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function updateAssigneesStatus(projectId: string, userIds: string[], status: 'active' | 'paused') {
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

    const { error } = await supabase
        .from('project_assignees')
        .update({ status })
        .eq('project_id', projectId)
        .in('user_id', userIds);

    if (error) {
        console.error('Error updating assignees status:', error);
        throw new Error('Failed to update status');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function toggleReviewerStatus(projectId: string, userId: string, isReviewer: boolean) {
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

    const { error } = await supabase
        .from('project_assignees')
        .update({ is_reviewer: isReviewer })
        .eq('project_id', projectId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error toggling reviewer status:', error);
        throw new Error('Failed to toggle reviewer status');
    }

    revalidatePath(`/dashboard/projects/${projectId}/team`);
}

export async function startTasking(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // 0. Cleanup stale tasks for this project
    try {
        await cleanupProjectTasks(projectId);
    } catch (e) {
        console.error('Error during cleanup in startTasking:', e);
    }

    // 1. Check if user is assigned to project (status active)
    const { data: assignment } = await supabase
        .from('project_assignees')
        .select('status')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (!assignment) {
        throw new Error('Not assigned to this project or inactive');
    }

    // 1.5 Check if user has completed all courses for this project
    const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('project_id', projectId);

    if (courses && courses.length > 0) {
        const { data: progress } = await supabase
            .from('user_course_progress')
            .select('status, course_id')
            .eq('user_id', user.id)
            .in('course_id', courses.map(c => c.id));

        const progressMap = new Map(progress?.map(p => [p.course_id, p.status]));
        let allCompleted = true;
        for (const course of courses) {
            if (progressMap.get(course.id) !== 'completed') {
                allCompleted = false;
                break;
            }
        }

        if (!allCompleted) {
            redirect(`/dashboard/projects/${projectId}?error=Please complete all required courses first`);
        }
    }

    // 2. Check for in_progress task (resume)
    const { data: inProgressTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId)
        .eq('assigned_to', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

    if (inProgressTask) {
        redirect(`/dashboard/tasks/${inProgressTask.id}`);
    }

    // 3. Check for pending task already assigned
    const { data: assignedPendingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId)
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'rejected'])
        .maybeSingle();

    if (assignedPendingTask) {
        console.log('Found assigned pending task:', assignedPendingTask.id);
        // Auto-start it
        await supabase
            .from('tasks')
            .update({ status: 'in_progress' })
            .eq('id', assignedPendingTask.id);

        redirect(`/dashboard/tasks/${assignedPendingTask.id}`);
    }

    console.log('No assigned tasks found. Looking for unassigned tasks in pool...');

    // 4. Find an unassigned task (JIT Assignment provided by "Start Tasking")
    // This replaces the manual "Claim" system with an automatic one.
    const { data: nextTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId)
        .is('assigned_to', null)
        .in('status', ['pending', 'rejected'])
        .limit(1)
        .maybeSingle();

    if (nextTask) {
        console.log('Found unassigned task, assigning:', nextTask.id);
        // Cleanly assign it
        const { error: claimError } = await supabase
            .from('tasks')
            .update({
                assigned_to: user.id,
                status: 'in_progress'
            })
            .eq('id', nextTask.id)
            .is('assigned_to', null);

        if (!claimError) {
            redirect(`/dashboard/tasks/${nextTask.id}`);
        } else {
            console.error('Failed to auto-assign task (race condition or permission)');
            // Retry logic could go here, but for now error out
            redirect(`/dashboard/projects/${projectId}?error=Could not assign task, please try again`);
        }
    }

    console.log('No tasks available at all.');
    // No tasks available or assigned
    redirect(`/dashboard/projects/${projectId}?error=No tasks available to start`);
}

/**
 * Allows Admin/PM to start a specific PENDING task as if they were an attempter.
 * Bypasses normal assignment/course checks since Admin/PM have full access.
 */
export async function startSpecificTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify user is admin or PM
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        throw new Error('Only Admin/PM can use this feature');
    }

    // Get the task
    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id, project_id, status, assigned_to')
        .eq('id', taskId)
        .single();

    if (taskError || !task) {
        throw new Error('Task not found');
    }

    if (task.status !== 'pending' && task.status !== 'rejected') {
        throw new Error('Can only start pending or rejected tasks');
    }

    // Start the task: assign to current user and set status to in_progress
    const { error: updateError } = await supabase
        .from('tasks')
        .update({
            assigned_to: user.id,
            status: 'in_progress'
        })
        .eq('id', taskId);

    if (updateError) {
        console.error('Error starting task:', updateError);
        throw new Error('Failed to start task');
    }

    redirect(`/dashboard/tasks/${taskId}`);
}

export async function startReviewing(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isInternal = profile?.role === 'pm' || profile?.role === 'admin';

    // 1. Check if user is a reviewer for this project (skip for Admin/PM)
    if (!isInternal) {
        const { data: assignment } = await supabase
            .from('project_assignees')
            .select('status, is_reviewer')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (!assignment || !assignment.is_reviewer) {
            redirect(`/dashboard/projects/${projectId}?error=You are not a reviewer for this project`);
        }
    }

    // 2. Find a task waiting for review (status = 'submitted')
    const { data: taskToReview } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId)
        .eq('status', 'submitted')
        .neq('assigned_to', user.id) // Don't review own tasks
        .limit(1)
        .maybeSingle();

    if (taskToReview) {
        redirect(`/dashboard/review/${taskToReview.id}`);
    }

    // No tasks to review - redirect back with message
    redirect(`/dashboard/projects/${projectId}?error=No tasks available for review`);
}
