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

    // 1. Fetch Project Courses (for qualification check)
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .eq('project_id', id);

    const requiredCourseIds = courses?.map(c => c.id) || [];

    // 2. Fetch ALL eligible profiles (excluding enterprise_client and guest?)
    // We want admins, pms, annotators, reviewers.
    const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, tags')
        .neq('role', 'enterprise_client')
        .order('full_name');

    console.log('ProjectTeamPage: allProfiles length:', allProfiles?.length);
    if (profilesError) console.error('ProjectTeamPage: profilesError:', profilesError);


    // 3. Fetch current assignments for this project
    const { data: assignments } = await supabase
        .from('project_assignees')
        .select('user_id')
        .eq('project_id', id);

    const assignedUserIds = new Set(assignments?.map(a => a.user_id) || []);

    // 4. Fetch All Progress for this project's courses
    // Optimization: only fetch if there are courses
    let progress: any[] = [];
    if (requiredCourseIds.length > 0 && allProfiles && allProfiles.length > 0) {
        const { data: p } = await supabase
            .from('user_course_progress')
            .select('*')
            .in('course_id', requiredCourseIds)
            .in('user_id', allProfiles.map(u => u.id));
        progress = p || [];
    }

    // 5. Merge data
    const team = (allProfiles || []).map((u: any) => {
        const userProgress = progress.filter(p => p.user_id === u.id);
        const completedCourses = userProgress.filter(p => p.status === 'completed').length || 0;
        const totalCourses = requiredCourseIds.length;
        const isQualified = totalCourses === 0 || completedCourses === totalCourses;
        const isAssigned = assignedUserIds.has(u.id);

        return {
            ...u,
            completedCourses,
            totalCourses,
            isQualified,
            isAssigned
        };
    });

    return (
        <TeamManagementClient
            projectId={id}
            initialMembers={team}
        />
    );
}
