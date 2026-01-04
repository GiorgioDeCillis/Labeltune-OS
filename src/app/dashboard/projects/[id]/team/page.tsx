import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { TeamManagementClient } from '@/components/dashboard/TeamManagementClient';

export default async function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify Access
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // 1. Fetch Project Courses
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .eq('project_id', id);

    const requiredCourseIds = courses?.map(c => c.id) || [];

    // 2. Fetch Assigned Users
    // Join project_assignees with profiles
    const { data: assignedUsers } = await supabase
        .from('project_assignees')
        .select(`
            user_id,
            profiles:user_id (
                id,
                email,
                full_name,
                role,
                avatar_url,
                tags
            )
        `)
        .eq('project_id', id);

    // Extract profiles from the join result
    const users = assignedUsers?.map((a: any) => a.profiles).filter(Boolean) || [];

    // 3. Fetch All Progress for this project's courses for the assigned users
    // Only if there are users, otherwise skip
    let progress: any[] = [];
    if (requiredCourseIds.length > 0 && users.length > 0) {
        const { data: p } = await supabase
            .from('user_course_progress')
            .select('*')
            .in('course_id', requiredCourseIds)
            .in('user_id', users.map((u: any) => u.id));
        progress = p || [];
    }

    // 4. Determine Qualification Status
    const team = users.map((u: any) => {
        const userProgress = progress.filter(p => p.user_id === u.id);
        const completedCourses = userProgress.filter(p => p.status === 'completed').length || 0;
        const totalCourses = requiredCourseIds.length;
        const isQualified = totalCourses === 0 || completedCourses === totalCourses;

        return {
            ...u,
            completedCourses,
            totalCourses,
            isQualified
        };
    });

    return (
        <TeamManagementClient
            projectId={id}
            initialMembers={team}
        />
    );
}
