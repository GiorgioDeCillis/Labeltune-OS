'use client';

import React, { useState } from 'react';
import { Course, Lesson } from '@/types/manual-types';
import { PlayCircle, CheckCircle, ChevronLeft, ChevronRight, Menu, FileText } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { completeLesson } from '@/app/dashboard/courses/actions';

interface CoursePlayerProps {
    course: Course & { lessons: Lesson[] };
    completedLessonIds?: string[];
}

export function CoursePlayer({ course, completedLessonIds = [] }: CoursePlayerProps) {
    const [activeLessonId, setActiveLessonId] = useState<string>(course.lessons?.[0]?.id || '');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const activeLesson = course.lessons.find(l => l.id === activeLessonId) || course.lessons[0];
    const activeIndex = course.lessons.findIndex(l => l.id === activeLessonId);

    const hasNext = activeIndex < course.lessons.length - 1;
    const hasPrev = activeIndex > 0;

    const handleNext = async () => {
        // Optimistic update or wait? Let's wait for simplicity in this MVP
        try {
            await completeLesson(course.id, activeLessonId);
            if (hasNext) {
                setActiveLessonId(course.lessons[activeIndex + 1].id);
            }
        } catch (error) {
            console.error("Failed to complete lesson", error);
            // Optionally show toast error
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setActiveLessonId(course.lessons[activeIndex - 1].id);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Sidebar (Lesson List) */}
            <div className={`glass-panel flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-white/5">
                    <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Course Content</h2>
                    <p className="font-bold truncate">{course.title}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {course.lessons.map((lesson, index) => {
                        const isActive = lesson.id === activeLessonId;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${isActive
                                        ? 'bg-primary/20 text-primary font-medium'
                                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {isActive ? (
                                        <PlayCircle className="w-4 h-4" />
                                    ) : isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-white/20 text-xs flex items-center justify-center">{index + 1}</div>
                                    )}
                                </div>
                                <span className="line-clamp-2">{lesson.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden rounded-2xl relative">
                {/* Toolbar */}
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold">{activeLesson?.title}</h3>
                    </div>
                    <Link href={`/dashboard/projects/${course.project_id}`}>
                        <button className="text-xs font-bold text-muted-foreground hover:text-white transition-colors">
                            Exit Course
                        </button>
                    </Link>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-4xl mx-auto w-full">
                    {activeLesson ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Loom/Video Embed */}
                            {activeLesson.video_url && (
                                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                    {activeLesson.video_url.includes('loom.com') ? (
                                        <iframe
                                            src={activeLesson.video_url.replace('/share/', '/embed/')}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    ) : (
                                        // Generic fallback or other providers could go here
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Video source not supported for generic embed yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text Content */}
                            {activeLesson.content && (
                                <div className="prose prose-invert prose-blue max-w-none">
                                    {/* Using simple div for now, but configured for ReactMarkdown later if needed */}
                                    <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-300">
                                        {activeLesson.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p>Select a lesson to start learning.</p>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="h-20 border-t border-white/5 bg-black/20 flex items-center justify-between px-8">
                    <button
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous Lesson
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!hasNext} // Later: change to "Complete & Continue" if last?
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${hasNext
                            ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                            : 'bg-white/10 text-muted-foreground cursor-not-allowed'
                            }`}
                    >
                        {hasNext ? 'Next Lesson' : 'Course Completed'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
