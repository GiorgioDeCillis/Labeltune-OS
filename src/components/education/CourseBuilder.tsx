'use client';

import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '@/types/manual-types';
import { createCourse, updateCourse, createLesson, updateLesson, deleteLesson, saveCourseWithLessons } from '@/app/dashboard/courses/actions';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Save, X, Video, FileText } from 'lucide-react';
import { QuizBuilder } from './QuizBuilder';
import { useToast } from '@/components/Toast';

interface GeneratedCourseData {
    course: {
        title: string;
        description: string;
        duration: string;
    };
    lessons: Partial<Lesson>[];
}

interface CourseBuilderProps {
    projectId?: string;
    existingCourse?: Course & { lessons: Lesson[] };
    projects?: { id: string, name: string }[];
    onSaveSuccess?: (courseId: string) => void;
    onCancel?: () => void;
    initialGeneratedData?: GeneratedCourseData | null;
}

export function CourseBuilder({ projectId: initialProjectId, existingCourse, projects, onSaveSuccess, onCancel, initialGeneratedData }: CourseBuilderProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || existingCourse?.project_id || '');

    // Course State
    const [courseTitle, setCourseTitle] = useState(existingCourse?.title || '');
    const [courseDescription, setCourseDescription] = useState(existingCourse?.description || '');
    const [courseDuration, setCourseDuration] = useState(existingCourse?.duration || '');

    // Lessons State (Local before save)
    const [lessons, setLessons] = useState<Partial<Lesson>[]>(
        existingCourse?.lessons?.sort((a, b) => a.order - b.order) || []
    );
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null); // For editing

    // Apply AI-generated data when provided
    useEffect(() => {
        if (initialGeneratedData) {
            setCourseTitle(initialGeneratedData.course.title);
            setCourseDescription(initialGeneratedData.course.description);
            setCourseDuration(initialGeneratedData.course.duration);
            setLessons(initialGeneratedData.lessons.map((l, i) => ({
                ...l,
                id: l.id || `temp-${Date.now()}-${i}`,
                order: i
            })));
        }
    }, [initialGeneratedData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLessons((items) => {
                const oldIndex = items.findIndex((item) => (item.id || item.title) === active.id);
                const newIndex = items.findIndex((item) => (item.id || item.title) === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddLesson = () => {
        const newLesson: Partial<Lesson> = {
            id: `temp-${Date.now()}`,
            title: 'New Lesson',
            content: '',
            video_url: '',
            order: lessons.length
        };
        setLessons([...lessons, newLesson]);
        setActiveLessonId(newLesson.id || null);
    };

    const handleUpdateLesson = (id: string, field: keyof Lesson, value: any) => {
        setLessons(lessons.map(l => (l.id === id || l.title === id) ? { ...l, [field]: value } : l));
    };

    const handleDeleteLesson = (id: string) => {
        setLessons(lessons.filter(l => l.id !== id));
        if (activeLessonId === id) setActiveLessonId(null);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            console.log('[CourseBuilder] handleSave started. existingCourse:', existingCourse?.id, 'selectedProjectId:', selectedProjectId);

            const result = await saveCourseWithLessons(
                selectedProjectId || null,
                {
                    title: courseTitle,
                    description: courseDescription,
                    duration: courseDuration
                },
                lessons,
                existingCourse?.id
            );

            if (result && result.success) {
                console.log('[CourseBuilder] Save successful, courseId:', result.courseId);
                showToast('Course saved successfully!', 'success');

                if (onSaveSuccess && result.courseId) {
                    onSaveSuccess(result.courseId);
                } else {
                    if (selectedProjectId) {
                        router.push(`/dashboard/projects/${selectedProjectId}`);
                    } else {
                        router.push('/dashboard/courses');
                    }
                    router.refresh();
                }
            } else {
                throw new Error('Unknown error during save');
            }

        } catch (error) {
            console.error('[CourseBuilder] Save failed:', error);
            const message = error instanceof Error ? error.message : 'Failed to save course';
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Outline & Form */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0">
                <div className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="font-bold">Course Details</h3>

                    {projects && !initialProjectId && !existingCourse && (
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-muted-foreground font-bold">Associated Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary text-sm"
                            >
                                <option value="">Global (No Project)</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-muted-foreground font-bold">Title</label>
                        <input
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary"
                            placeholder="Course Title"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-muted-foreground font-bold">Description</label>
                        <textarea
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary h-24"
                            placeholder="Brief description..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-muted-foreground font-bold">Duration</label>
                        <input
                            value={courseDuration}
                            onChange={(e) => setCourseDuration(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary"
                            placeholder="e.g. 30m"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Course</>}
                    </button>
                    <button
                        onClick={() => onCancel ? onCancel() : router.back()}
                        className="w-full py-2 border border-white/10 hover:bg-white/5 rounded-lg text-sm"
                    >
                        Cancel
                    </button>
                </div>

                <div className="glass-panel p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Lessons</h3>
                        <button
                            onClick={handleAddLesson}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Add Lesson
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={lessons.map(l => l.id || l.title || '')}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {lessons.map((lesson) => (
                                    <SortableLessonItem
                                        key={lesson.id}
                                        id={lesson.id || lesson.title || ''}
                                        lesson={lesson}
                                        isActive={activeLessonId === lesson.id}
                                        onClick={() => setActiveLessonId(lesson.id || null)}
                                        onDelete={() => handleDeleteLesson(lesson.id!)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Right: Lesson Editor */}
            <div className="lg:col-span-8 min-h-[500px]">
                {activeLessonId ? (
                    <div className="glass-panel p-8 rounded-xl space-y-6 h-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Edit Lesson
                            </h3>
                            <button onClick={() => setActiveLessonId(null)} className="text-muted-foreground hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {lessons.map(l => {
                            if (l.id !== activeLessonId) return null;
                            return (
                                <div key={l.id} className="space-y-6 animate-in fade-in">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-muted-foreground font-bold">Lesson Title</label>
                                        <input
                                            value={l.title}
                                            onChange={(e) => handleUpdateLesson(l.id!, 'title', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-lg font-bold focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs uppercase text-muted-foreground font-bold">Lesson Type</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleUpdateLesson(l.id!, 'type', 'text')}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${l.type === 'text' || !l.type ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                            >
                                                Text / Video
                                            </button>
                                            <button
                                                onClick={() => handleUpdateLesson(l.id!, 'type', 'quiz')}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${l.type === 'quiz' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                            >
                                                Quiz
                                            </button>
                                        </div>
                                    </div>

                                    {(l.type === 'quiz') ? (
                                        <QuizBuilder
                                            lesson={l}
                                            onChange={(data) => handleUpdateLesson(l.id!, 'quiz_data', data)}
                                        />
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-2">
                                                    <Video className="w-3 h-3" /> Loom Video URL
                                                </label>
                                                <input
                                                    value={l.video_url || ''}
                                                    onChange={(e) => handleUpdateLesson(l.id!, 'video_url', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-sm focus:outline-none focus:border-primary"
                                                    placeholder="https://www.loom.com/share/..."
                                                />
                                                <p className="text-xs text-muted-foreground">Paste the share link from Loom. It will be automatically embedded.</p>
                                            </div>

                                            <div className="space-y-2 h-full flex flex-col">
                                                <label className="text-xs uppercase text-muted-foreground font-bold">Content (Markdown)</label>
                                                <textarea
                                                    value={l.content || ''}
                                                    onChange={(e) => handleUpdateLesson(l.id!, 'content', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-primary min-h-[300px] flex-1"
                                                    placeholder="# Lesson Content..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-xl flex flex-col items-center justify-center h-full text-muted-foreground border-dashed border-2 border-white/5">
                        <FileText className="w-12 h-12 mb-4 opacity-50" />
                        <p>Select a lesson from the list to edit its content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SortableLessonItem({ id, lesson, isActive, onClick, onDelete }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div
                onClick={onClick}
                className={`p-3 pl-10 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${isActive
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
            >
                <span className="truncate text-sm font-medium">{lesson.title}</span>
            </div>

            {/* Drag Handle */}
            <button {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
}
