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
    revalidatePath('/dashboard/knowledge/courses');
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
    revalidatePath(`/dashboard/knowledge/courses/${courseId}`);
    revalidatePath('/dashboard/knowledge/courses');
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

    revalidatePath('/dashboard/knowledge/courses');
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
    revalidatePath(`/dashboard/knowledge/courses/${courseId}`);
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
    revalidatePath(`/dashboard/knowledge/courses/${lessonId}`); // Assuming we might view course details
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

    revalidatePath(`/dashboard/knowledge/courses/${courseId}`);
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

const isValidUUID = (id: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(id);
};

export async function saveCourseWithLessons(
    projectId: string | null,
    courseData: Partial<Course>,
    lessons: Partial<Lesson>[],
    courseId?: string
) {
    console.log('[saveCourseWithLessons] Started. CourseId:', courseId, 'Lessons count:', lessons.length);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    let finalCourseId = courseId;

    try {
        // 1. Create or Update Course
        if (courseId) {
            const { error: updateError } = await supabase
                .from('courses')
                .update({
                    title: courseData.title,
                    description: courseData.description,
                    duration: courseData.duration
                })
                .eq('id', courseId);

            if (updateError) throw new Error(`Failed to update course: ${updateError.message}`);
        } else {
            const { data: newCourse, error: createError } = await supabase
                .from('courses')
                .insert({
                    project_id: projectId || null,
                    title: courseData.title!,
                    description: courseData.description,
                    duration: courseData.duration
                })
                .select()
                .single();

            if (createError) throw new Error(`Failed to create course: ${createError.message}`);
            finalCourseId = newCourse.id;
        }

        if (!finalCourseId) throw new Error('Failed to determine course ID');

        // 2. Handle Lessons
        // First delete existing lessons not present in the new list (if updating)
        if (courseId) {
            // CRITICAL FIX: Only include valid UUIDs in the filter to avoid Postgres "invalid input syntax for uuid" error
            const currentIds = lessons
                .map(l => l.id)
                .filter((id): id is string => !!id && isValidUUID(id));

            // Get all lessons for course, identify which to delete.
            const { data: allExisting } = await supabase.from('lessons').select('id').eq('course_id', finalCourseId);
            if (allExisting) {
                const toDelete = allExisting.filter(e => !currentIds.includes(e.id)).map(e => e.id);
                if (toDelete.length > 0) {
                    await supabase.from('lessons').delete().in('id', toDelete);
                }
            }
        }

        // 3. Upsert Lessons
        // We handle this sequentially to ensure order and avoid complexity with bulk upsert of mixed new/old
        for (let i = 0; i < lessons.length; i++) {
            const l = lessons[i];
            // Treat as new if ID is missing OR if it is not a valid UUID (e.g. temp-..., lesson-...)
            const isNew = !l.id || !isValidUUID(l.id);

            const lessonPayload = {
                course_id: finalCourseId,
                title: l.title!,
                content: l.content || '',
                order: i,
                video_url: l.video_url || '',
                type: l.type || 'text',
                quiz_data: l.quiz_data || null
            };

            if (isNew) {
                const { error } = await supabase.from('lessons').insert(lessonPayload);
                if (error) {
                    console.error('[saveCourseWithLessons] Error inserting lesson:', i, error);
                    throw error;
                }
            } else {
                const { error } = await supabase
                    .from('lessons')
                    .update(lessonPayload)
                    .eq('id', l.id!);
                if (error) {
                    console.error('[saveCourseWithLessons] Error updating lesson:', l.id, error);
                    throw error;
                }
            }
        }

    } catch (error: any) {
        console.error('[saveCourseWithLessons] Critical error:', error);
        throw new Error(error.message || 'Failed to save course and lessons');
    }

    // 4. Revalidate
    revalidatePath(`/dashboard/knowledge/courses/${finalCourseId}`);
    if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard/knowledge/courses');

    return { success: true, courseId: finalCourseId };
}
