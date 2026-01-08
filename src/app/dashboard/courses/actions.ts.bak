'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Course, Lesson } from '@/types/manual-types';

export async function createCourse(projectId: string | null, data: Partial<Course>) {
    console.log('[createCourse] Called with projectId:', projectId, 'data title:', data.title);
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
    revalidatePath('/dashboard/courses');
}

export async function deleteCourse(courseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check if course is linked to a project
    const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('project_id')
        .eq('id', courseId)
        .single();

    if (fetchError) throw new Error(fetchError.message);
    if (course?.project_id) {
        throw new Error('Cannot delete course linked to a project');
    }

    try {
        // Delete associated lessons first
        await supabase.from('lessons').delete().eq('course_id', courseId);

        // Delete course progress records
        await supabase.from('user_course_progress').delete().eq('course_id', courseId);

        // Delete the course
        const { error, count } = await supabase
            .from('courses')
            .delete({ count: 'exact' })
            .eq('id', courseId);

        if (error) throw new Error(error.message);
        if (count === 0) throw new Error('Course not found or permission denied');

    } catch (error: any) {
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/courses');
    return { success: true };
}

export async function createLesson(courseId: string, data: Partial<Lesson>) {
    console.log('[createLesson] Starting with courseId:', courseId, 'data:', JSON.stringify(data));
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

    if (error) {
        console.error('[createLesson] Error creating lesson:', error.message);
        throw new Error(error.message);
    }
    console.log('[createLesson] Success, created lesson id:', lesson.id);
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
        console.error('completeLesson: No user found');
        throw new Error('Unauthorized');
    }

    console.log('completeLesson called:', { courseId, lessonId, userId: user.id });

    // Check if progress record exists
    const { data: progress, error: fetchError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

    if (fetchError) {
        console.error('Error fetching progress:', fetchError);
        throw new Error('Failed to fetch progress');
    }

    console.log('Current progress:', progress);

    const completedLessons = progress ? (progress.completed_lessons || []) : [];

    if (!completedLessons.includes(lessonId)) {
        const newCompletedLessons = [...completedLessons, lessonId];

        // Check if all lessons are completed
        const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);

        const isCourseCompleted = count ? newCompletedLessons.length >= count : false;

        console.log('Updating progress:', { newCompletedLessons, isCourseCompleted, lessonCount: count });

        if (progress) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('user_course_progress')
                .update({
                    completed_lessons: newCompletedLessons,
                    status: isCourseCompleted ? 'completed' : 'in_progress',
                    updated_at: new Date().toISOString()
                })
                .eq('id', progress.id);

            if (updateError) {
                console.error('Error updating progress:', updateError);
                throw new Error('Failed to update progress');
            }
            console.log('Progress updated successfully');
        } else {
            // Insert new record
            const { error: insertError } = await supabase
                .from('user_course_progress')
                .insert({
                    user_id: user.id,
                    course_id: courseId,
                    completed_lessons: newCompletedLessons,
                    status: isCourseCompleted ? 'completed' : 'in_progress',
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error inserting progress:', insertError);
                throw new Error('Failed to insert progress');
            }
            console.log('Progress inserted successfully');
        }
    } else {
        console.log('Lesson already completed, skipping');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
}


export async function getNextCourseId(currentCourseId: string) {
    const supabase = await createClient();

    // Get current course to find its project_id
    const { data: currentCourse } = await supabase
        .from('courses')
        .select('project_id, created_at')
        .eq('id', currentCourseId)
        .single();

    if (!currentCourse || !currentCourse.project_id) return null;

    // Get all courses for this project, ordered by creation (or order if you had it)
    // Assuming simple chronological order for now
    const { data: courses } = await supabase
        .from('courses')
        .select('id, created_at')
        .eq('project_id', currentCourse.project_id)
        .order('created_at', { ascending: true });

    if (!courses) return null;

    const currentIndex = courses.findIndex(c => c.id === currentCourseId);
    if (currentIndex === -1 || currentIndex === courses.length - 1) {
        return null;
    }

    return courses[currentIndex + 1].id;
}
