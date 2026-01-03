'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeLesson(courseId: string, lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Check if progress record exists
    const { data: progress, error: fetchError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching progress:', fetchError);
        throw new Error('Failed to fetch progress');
    }

    const completedLessons = progress ? (progress.completed_lessons || []) : [];

    if (!completedLessons.includes(lessonId)) {
        const newCompletedLessons = [...completedLessons, lessonId];

        // Upsert progress
        const { error: upsertError } = await supabase
            .from('user_course_progress')
            .upsert({
                user_id: user.id,
                course_id: courseId,
                completed_lessons: newCompletedLessons,
                status: 'in_progress', // You logic to determine 'completed' can go here
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error('Error updating progress:', upsertError);
            throw new Error('Failed to update progress');
        }
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
}
