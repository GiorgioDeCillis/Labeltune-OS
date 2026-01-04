'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Plus, Search, GraduationCap } from 'lucide-react';
import { Course } from '@/types/manual-types';
import { createCourse } from '@/app/dashboard/courses/actions';

interface CoursesStepProps {
    availableCourses: Course[];
    selectedCourseIds: string[];
    onToggleCourse: (id: string) => void;
    onCourseCreated: (course: Course) => void;
}

export function CoursesStep({ availableCourses, selectedCourseIds, onToggleCourse, onCourseCreated }: CoursesStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredCourses = availableCourses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseTitle.trim()) return;

        setIsLoading(true);
        try {
            // We pass null for project_id because the project isn't created yet.
            // We will link it after the project is created in the final step action.
            const course = await createCourse(null, {
                title: newCourseTitle,
                description: 'New course created during project setup.',
                duration: '15m'
            });
            onCourseCreated(course as Course);
            onToggleCourse(course.id);
            setNewCourseTitle('');
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create course:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-bold">Project Courses</h3>
                    <p className="text-sm text-muted-foreground">Select existing training courses or create new ones for this project.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Course
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="glass-panel p-6 rounded-xl border-primary/30 bg-primary/5 animate-in zoom-in-95 duration-200">
                    <form onSubmit={handleCreateCourse} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold uppercase text-primary">New Course Title</label>
                            <input
                                autoFocus
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                placeholder="e.g. Introduction to Bounding Boxes"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !newCourseTitle.trim()}
                                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Creating...' : 'Create & Select'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-white/10">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search available courses..."
                    className="bg-transparent flex-1 focus:outline-none text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                        const isSelected = selectedCourseIds.includes(course.id);
                        return (
                            <button
                                key={course.id}
                                onClick={() => onToggleCourse(course.id)}
                                className={`p-4 rounded-2xl flex flex-col gap-3 text-left transition-all border-2 ${isSelected
                                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                        : 'bg-white/5 border-transparent hover:border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'}`}>
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    {isSelected ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-white/10" />}
                                </div>
                                <div>
                                    <h4 className="font-bold truncate">{course.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{course.description || 'No description.'}</p>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <GraduationCap className="w-3 h-3" />
                                    {course.duration || '15m'}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-50">
                        <Search className="w-12 h-12 mb-4" />
                        <p>No courses found matching your search.</p>
                    </div>
                )}
            </div>

            {selectedCourseIds.length > 0 && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium">Selected <span className="text-primary font-bold">{selectedCourseIds.length}</span> course(s) to include in this project.</span>
                    <div className="flex -space-x-2">
                        {selectedCourseIds.slice(0, 5).map((id, i) => (
                            <div key={id} className="w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                                {i + 1}
                            </div>
                        ))}
                        {selectedCourseIds.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                +{selectedCourseIds.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
