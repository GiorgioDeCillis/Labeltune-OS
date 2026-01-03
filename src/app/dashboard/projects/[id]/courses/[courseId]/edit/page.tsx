import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CourseBuilder } from '@/components/education/CourseBuilder';
import { Course, Lesson } from '@/types/manual-types';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string, courseId: string }> }) {
    const { id, courseId } = await params; // id is project_id
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

    // Fetch Course
    const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('project_id', id)
        .single();

    if (!courseData) notFound();

    // Fetch Lessons
    const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

    const fullCourse: Course & { lessons: Lesson[] } = {
        ...courseData,
        lessons: lessonsData || []
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Course</h2>
                    <p className="text-muted-foreground">{courseData.title}</p>
                </div>
            </div>

            <CourseBuilder projectId={id} existingCourse={fullCourse} />
        </div>
    );
}
