import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ManageCoursesClient } from './ManageCoursesClient';
import { Course } from '@/types/manual-types';

export default async function ManageProjectCoursesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // 1. Fetch Project
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (!project) notFound();

    // 2. Verify role (only PM/Admin can manage courses)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isPM = profile?.role === 'pm' || profile?.role === 'admin';
    if (!isPM) redirect(`/dashboard/projects/${id}`);

    // 3. Fetch all available courses
    const { data: allCourses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    // 4. Identify currently linked courses
    const initialSelectedCourseIds = allCourses
        ?.filter(c => c.project_id === id)
        .map(c => c.id) || [];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <ManageCoursesClient
                projectId={id}
                projectName={project.name}
                availableCourses={(allCourses || []) as Course[]}
                initialSelectedCourseIds={initialSelectedCourseIds}
            />
        </div>
    );
}
