'use client';

import React, { useState, useTransition } from 'react';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CoursesStep } from '@/app/dashboard/projects/new/steps/CoursesStep';
import { Course } from '@/types/manual-types';
import { updateProjectCourses } from '@/app/dashboard/projects/actions';

interface ManageCoursesClientProps {
    projectId: string;
    projectName: string;
    availableCourses: Course[];
    initialSelectedCourseIds: string[];
}

export function ManageCoursesClient({
    projectId,
    projectName,
    availableCourses,
    initialSelectedCourseIds
}: ManageCoursesClientProps) {
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(initialSelectedCourseIds);
    const [courses, setCourses] = useState<Course[]>(availableCourses);
    const [isPending, startTransition] = useTransition();

    const handleToggleCourse = (id: string) => {
        setSelectedCourseIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleCourseCreated = async (courseId: string) => {
        try {
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();
            const { data: course } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (course) {
                setCourses(prev => [course as Course, ...prev]);
                setSelectedCourseIds(prev => [...prev, course.id]);
            }
        } catch (err) {
            console.error('Error fetching new course:', err);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateProjectCourses(projectId, selectedCourseIds);
            } catch (error) {
                console.error('Error updating courses:', error);
                alert('Failed to update project courses. Please try again.');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Manage Courses</h2>
                        <p className="text-muted-foreground">Select training materials for <span className="text-white font-medium">{projectName}</span></p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/10">
                <CoursesStep
                    availableCourses={courses}
                    selectedCourseIds={selectedCourseIds}
                    onToggleCourse={handleToggleCourse}
                    onCourseCreated={handleCourseCreated}
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Link href={`/dashboard/projects/${projectId}`}>
                    <button className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition-all">
                        Cancel
                    </button>
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
