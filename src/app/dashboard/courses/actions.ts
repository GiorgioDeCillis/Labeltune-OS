'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Course, Lesson } from '@/types/manual-types';

export async function createCourse(projectId: string | null, data: Partial<Course>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: course, error } = await supabase
        .from('courses')
        .insert({
            project_id: projectId || null,
            title: data.title!,
            description: data.description,
            duration: data.duration
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (projectId) {
        revalidatePath(`/dashboard/projects/${projectId}`);
    }
    revalidatePath('/dashboard/courses');
    return course;
}

export async function updateCourse(courseId: string, data: Partial<Course>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('courses')
        .update({
            title: data.title,
            description: data.description,
            duration: data.duration
        })
        .eq('id', courseId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/courses/${courseId}`);
}

export async function createLesson(courseId: string, data: Partial<Lesson>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
            course_id: courseId,
            title: data.title!,
            content: data.content,
            order: data.order || 0,
            video_url: data.video_url,
            type: data.type || 'text',
            quiz_data: data.quiz_data
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/courses/${courseId}`);
    return lesson;
}

export async function updateLesson(lessonId: string, data: Partial<Lesson>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('lessons')
        .update({
            title: data.title,
            content: data.content,
            order: data.order,
            video_url: data.video_url,
            type: data.type,
            quiz_data: data.quiz_data
        })
        .eq('id', lessonId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/courses/${lessonId}`); // Assuming we might view course details
}

export async function deleteLesson(lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

    if (error) throw new Error(error.message);
}

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

        // Check if all lessons are completed
        const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);

        const isCourseCompleted = count ? newCompletedLessons.length === count : false;

        // Upsert progress
        const { error: upsertError } = await supabase
            .from('user_course_progress')
            .upsert({
                user_id: user.id,
                course_id: courseId,
                completed_lessons: newCompletedLessons,
                status: isCourseCompleted ? 'completed' : 'in_progress',
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error('Error updating progress:', upsertError);
            throw new Error('Failed to update progress');
        }
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
}
