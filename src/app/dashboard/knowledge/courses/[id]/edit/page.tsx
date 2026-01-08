import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CourseBuilder } from '@/components/education/CourseBuilder';
import { Course, Lesson } from '@/types/manual-types';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    // Fetch Course details
    const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

    if (!courseData) notFound();

    // Fetch Lessons
    const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order', { ascending: true });

    const fullCourse: Course & { lessons: Lesson[] } = {
        ...courseData,
        lessons: lessonsData || []
    };

    // Fetch Projects for the selector (in case they want to change the association)
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Edit Course</h2>
                    <p className="text-muted-foreground">Modify course details and lessons.</p>
                </div>
            </div>

            <CourseBuilder
                existingCourse={fullCourse}
                projects={projects || []}
            />
        </div>
    );
}
