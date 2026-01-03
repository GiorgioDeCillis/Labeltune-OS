import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CoursePlayer } from '@/components/education/CoursePlayer';
import { Course, Lesson } from '@/types/manual-types';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

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

    // Fetch User Progress
    const { data: progressData } = await supabase
        .from('user_course_progress')
        .select('completed_lessons')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();

    const fullCourse: Course & { lessons: Lesson[] } = {
        ...courseData,
        lessons: lessonsData || []
    };

    return (
        <div className="h-full">
            <CoursePlayer
                course={fullCourse}
                completedLessonIds={progressData?.completed_lessons || []}
            />
        </div>
    );
}
