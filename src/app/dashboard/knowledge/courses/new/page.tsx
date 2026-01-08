import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CourseBuilder } from '@/components/education/CourseBuilder';

export default async function NewCoursePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify Access (PM/Admin only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        redirect('/dashboard/knowledge/courses');
    }

    // Fetch Projects for the selector
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Create New Course</h2>
                    <p className="text-muted-foreground">Add training material to one of your projects or create a global course.</p>
                </div>
            </div>

            <CourseBuilder projects={projects || []} />
        </div>
    );
}
