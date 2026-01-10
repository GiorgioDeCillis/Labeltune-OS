'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getUserDetails(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check permissions
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile || !['admin', 'pm'].includes(currentUserProfile.role)) {
        throw new Error('Unauthorized');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
        throw new Error('Invalid User ID format');
    }

    const adminSupabase = await createAdminClient();

    // Fetch auth user data
    const { data: authUser, error: authUserError } = await adminSupabase.auth.admin.getUserById(userId);

    if (authUserError || !authUser.user) {
        throw new Error(`Failed to fetch auth user: ${authUserError?.message || 'User not found'}`);
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    }

    // Fetch tasks for earnings and stats
    const { data: tasks, error: tasksError } = await adminSupabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${userId},reviewed_by.eq.${userId}`);

    if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
    }

    // Fetch access logs
    const { data: accessLogs, error: accessLogsError } = await adminSupabase
        .rpc('get_user_access_logs', { target_user_id: userId });

    if (accessLogsError) {
        console.error('Error fetching access logs:', accessLogsError);
    }

    // Fetch course progress
    const { data: courseProgress, error: progressError } = await adminSupabase
        .from('user_course_progress')
        .select(`
            *,
            course:courses(*)
        `)
        .eq('user_id', userId);

    if (progressError) {
        console.error('Error fetching course progress:', progressError);
    }

    // Fetch project assignments
    const { data: projectAssignments, error: assignmentsError } = await adminSupabase
        .from('project_assignees')
        .select(`
            *,
            project:projects(*)
        `)
        .eq('user_id', userId);

    if (assignmentsError) {
        console.error('Error fetching project assignments:', assignmentsError);
    }

    // Calculate stats
    const annotatorTasks = tasks?.filter(t => t.assigned_to === userId) || [];
    const reviewerTasks = tasks?.filter(t => t.reviewed_by === userId) || [];

    const totalEarnings = (tasks || []).reduce((acc, task) => {
        let earning = 0;
        if (task.assigned_to === userId) earning += (task.annotator_earnings || 0);
        if (task.reviewed_by === userId) earning += (task.reviewer_earnings || 0);
        return acc + earning;
    }, 0);

    const completedTasksCount = annotatorTasks.filter(t => t.status === 'approved').length;
    const reviewedTasksCount = reviewerTasks.filter(t => t.status === 'approved' || t.status === 'rejected').length;

    // Calculate average rating
    const ratedTasks = annotatorTasks.filter(t => t.review_rating);
    const avgRating = ratedTasks.length > 0
        ? ratedTasks.reduce((acc, t) => acc + (t.review_rating || 0), 0) / ratedTasks.length
        : 0;

    // Calculate project-specific stats
    const projectStats = (projectAssignments || []).map(assignment => {
        const pTasks = annotatorTasks.filter(t => t.project_id === assignment.project_id);
        const pCompleted = pTasks.filter(t => t.status === 'approved');
        const pEarnings = pTasks.reduce((acc, t) => acc + (t.annotator_earnings || 0), 0);

        // Avg time spent per task (in seconds)
        const pTimeSpent = pTasks.filter(t => t.annotator_time_spent).reduce((acc, t) => acc + (t.annotator_time_spent || 0), 0);
        const pAvgTime = pTasks.length > 0 ? pTimeSpent / pTasks.length : 0;

        return {
            projectId: assignment.project_id,
            projectName: assignment.project?.name,
            projectType: assignment.project?.type,
            completedTasks: pCompleted.length,
            totalEarnings: pEarnings,
            avgTimeSpent: pAvgTime,
            status: assignment.status
        };
    });

    console.log('Fetched Profile:', profile); // Debug log

    return {
        authUser: {
            ...authUser.user,
            last_sign_in_ip: authUser.user?.last_sign_in_at ? (authUser.user as any).last_sign_in_ip : null
        },
        profile,
        stats: {
            totalEarnings,
            completedTasksCount,
            reviewedTasksCount,
            avgRating,
            totalTasksAssigned: annotatorTasks.length,
            totalReviewsAssigned: reviewerTasks.length,
            projectStats
        },
        courseProgress: courseProgress || [],
        recentActivity: tasks?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50) || [],
        accessLogs: accessLogs || []
    };
}

export async function updateUserProfile(userId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Check permissions
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile || !['admin', 'pm'].includes(currentUserProfile.role)) {
        throw new Error('Unauthorized');
    }

    const adminSupabase = await createAdminClient();

    const updates: any = {};
    const textFields = ['first_name', 'last_name', 'phone_number', 'address', 'paypal_email', 'linkedin_url', 'github_url', 'website_url', 'nationality', 'locale_tag', 'primary_language'];
    const dateFields = ['birth_date'];

    textFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) updates[field] = value;
    });

    dateFields.forEach(field => {
        const value = formData.get(field);
        if (value) updates[field] = value;
    });

    // Handle role update if provided and user is admin (PMs might not be allowed to change roles of other admins, but for now allow both)
    const role = formData.get('role');
    if (role && currentUserProfile.role === 'admin') {
        updates['role'] = role;
    }

    const { error } = await adminSupabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }

    revalidatePath(`/dashboard/users/${userId}`);
    revalidatePath('/dashboard/users');
    return { success: true };
}
