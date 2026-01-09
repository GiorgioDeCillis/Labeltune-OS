'use client';

import React, { useState } from 'react';
import { Course, Lesson } from '@/types/manual-types';
import { PlayCircle, CheckCircle, ChevronLeft, ChevronRight, Menu, FileText, Pencil, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { QuizPlayer } from './QuizPlayer';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { completeLesson, getNextCourseId } from '@/app/dashboard/knowledge/courses/actions';
import { useToast } from '@/components/Toast';
import confetti from 'canvas-confetti';
import { ProjectGuidelinesLink } from '@/components/ProjectGuidelinesLink';
import { InstructionSection } from '@/types/manual-types';

interface CoursePlayerProps {
    course: Course & { lessons: Lesson[] };
    completedLessonIds?: string[];
    isAdmin?: boolean;
    guidelines?: InstructionSection[] | string;
}

export function CoursePlayer({ course, completedLessonIds = [], isAdmin = false, guidelines }: CoursePlayerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [activeLessonId, setActiveLessonId] = useState<string>(course.lessons?.[0]?.id || '');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [localCompletedLessons, setLocalCompletedLessons] = useState<string[]>(completedLessonIds);
    const [isSaving, setIsSaving] = useState(false);

    const activeLesson = course.lessons.find(l => l.id === activeLessonId) || course.lessons[0];
    const activeIndex = course.lessons.findIndex(l => l.id === activeLessonId);

    const hasNext = activeIndex < course.lessons.length - 1;
    const hasPrev = activeIndex > 0;

    const handleNext = async () => {
        // Optimistic update: Navigate immediately
        const lessonToComplete = activeLessonId;

        // Update local state optimistically
        setLocalCompletedLessons(prev => prev.includes(lessonToComplete) ? prev : [...prev, lessonToComplete]);

        if (hasNext) {
            setActiveLessonId(course.lessons[activeIndex + 1].id);
        }

        setIsSaving(true);
        try {
            await completeLesson(course.id, lessonToComplete);
            showToast('Lesson saved!', 'success');
        } catch (error: any) {
            console.error("Failed to complete lesson", error);
            showToast(`Error saving: ${error?.message || 'Unknown error'}`, 'error');
            // Revert optimistic update
            setLocalCompletedLessons(prev => prev.filter(id => id !== lessonToComplete));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setActiveLessonId(course.lessons[activeIndex - 1].id);
        }
    };

    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [nextCourseId, setNextCourseId] = useState<string | null>(null);

    const handleCompleteCourse = async () => {
        setIsSaving(true);
        try {
            // Mark last lesson as completed locally
            setLocalCompletedLessons(prev => prev.includes(activeLessonId) ? prev : [...prev, activeLessonId]);

            await completeLesson(course.id, activeLessonId);
            // Check for next course
            const nextId = await getNextCourseId(course.id);
            setNextCourseId(nextId);
            setShowCompletionModal(true);
            showToast('Course completed!', 'success');

            // Trigger confetti
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
        } catch (error: any) {
            console.error("Failed to complete course", error);
            showToast(`Error: ${error?.message || 'Failed to complete course'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-1 gap-6 overflow-hidden h-full min-h-0 relative">
            {/* Sidebar (Lesson List) */}
            <div className={`glass-panel flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-white/5">
                    <h2 className="font-bold text-sm text-white/40 uppercase tracking-wider mb-1">Course Content</h2>
                    <p className="font-bold truncate text-white">{course.title}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {course.lessons.map((lesson, index) => {
                        const isActive = lesson.id === activeLessonId;
                        const isCompleted = localCompletedLessons.includes(lesson.id);

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
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold text-white">{activeLesson?.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        {guidelines && (
                            <ProjectGuidelinesLink
                                guidelines={guidelines}
                                label="Course Guidelines"
                                className="text-xs font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5"
                            />
                        )}

                        {isAdmin && (
                            <Link href={`/dashboard/knowledge/courses/${course.id}/edit`}>
                                <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                                    <Pencil className="w-3 h-3" /> Edit Course
                                </button>
                            </Link>
                        )}
                        <Link href={course.project_id ? `/dashboard/projects/${course.project_id}` : '/dashboard/knowledge'}>
                            <button className="text-xs font-bold text-muted-foreground hover:text-white transition-colors">
                                Exit Course
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-4xl mx-auto w-full">
                    {activeLesson ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            {activeLesson.type === 'quiz' ? (
                                <QuizPlayer
                                    key={activeLesson.id}
                                    lesson={activeLesson}
                                    onComplete={() => {
                                        // Refresh passed state logic if needed, usually handled by parent re-render or internal state
                                        router.refresh();
                                    }}
                                />
                            ) : (
                                <div className="max-w-4xl mx-auto p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Video Player */}
                                    {activeLesson.video_url && (
                                        <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                            <iframe
                                                src={activeLesson.video_url.replace('share', 'embed')}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-a:text-primary">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeLesson.content || ''}</ReactMarkdown>
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
                        disabled={!hasPrev || isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous Lesson
                    </button>

                    {hasNext ? (
                        <button
                            onClick={handleNext}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Next Lesson <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCompleteCourse}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Complete Course <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>

            </div>

            {/* Completion Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Course Completed!</h3>
                                <p className="text-muted-foreground">
                                    You have successfully finished <br />
                                    <span className="text-white font-medium">{course.title}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 w-full pt-4">
                                {nextCourseId ? (
                                    <Link href={`/dashboard/knowledge/courses/${nextCourseId}`}>
                                        <button className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                            Start Next Course <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                ) : null}

                                <Link href={course.project_id ? `/dashboard/projects/${course.project_id}` : '/dashboard/knowledge'}>
                                    <button className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${nextCourseId
                                        ? 'bg-white/5 hover:bg-white/10 text-white'
                                        : 'bg-primary text-primary-foreground hover:opacity-90'
                                        }`}>
                                        Return to Dashboard
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
