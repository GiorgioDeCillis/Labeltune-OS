'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Circle, Plus, Search, GraduationCap, X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { Course, Lesson } from '@/types/manual-types';
import { CourseBuilder } from '@/components/education/CourseBuilder';
import { createPortal } from 'react-dom';
import { useToast } from '@/components/Toast';
import { getInstructionSets } from '@/app/dashboard/instructions/actions';
import CustomSelect from '@/components/CustomSelect';

interface InstructionSection {
    id: string;
    title: string;
    content: string;
}

interface CoursesStepProps {
    availableCourses: Course[];
    selectedCourseIds: string[];
    onToggleCourse: (id: string) => void;
    onCourseCreated: (courseId: string) => void;
    instructions?: InstructionSection[];
}

interface GeneratedCourseData {
    course: {
        title: string;
        description: string;
        duration: string;
    };
    lessons: Partial<Lesson>[];
}

export function CoursesStep({ availableCourses, selectedCourseIds, onToggleCourse, onCourseCreated, instructions = [] }: CoursesStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { showToast } = useToast();

    // AI Generation states
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratedCourseData | null>(null);
    const [genOptions, setGenOptions] = useState({
        lessonCount: 0,
        questionsPerQuiz: 4,
        includeIntro: true,
        includeFinalAssessment: true
    });

    // Instruction Selection State
    const [instructionSource, setInstructionSource] = useState<'wizard' | 'saved'>('wizard');
    const [savedInstructionSets, setSavedInstructionSets] = useState<{ id: string, name: string, content: any }[]>([]);
    const [selectedSavedId, setSelectedSavedId] = useState<string>('');
    const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);

    useEffect(() => {
        // Default to wizard if instructions exist, otherwise saved
        if (instructions.length === 0) {
            setInstructionSource('saved');
        } else {
            setInstructionSource('wizard');
        }

        // Fetch saved instructions
        const fetchInstructions = async () => {
            setIsLoadingInstructions(true);
            try {
                const sets = await getInstructionSets();
                setSavedInstructionSets(sets);
                if (sets.length > 0 && !selectedSavedId) {
                    setSelectedSavedId(sets[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch instructions', error);
            } finally {
                setIsLoadingInstructions(false);
            }
        };
        fetchInstructions();
    }, [instructions]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredCourses = availableCourses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveSuccess = (courseId: string) => {
        onCourseCreated(courseId);
        onToggleCourse(courseId);
        setIsCreating(false);
        setGeneratedData(null);
    };

    const handleGenerateCourse = async () => {
        if (instructions.length === 0) {
            showToast('Please add instructions in the previous step first.', 'error');
            return;
        }

        setIsGenerating(true);

        try {
            // Determine which instructions to use
            let selectedInstructions = instructions;

            if (instructionSource === 'saved') {
                const selectedSet = savedInstructionSets.find(s => s.id === selectedSavedId);
                if (!selectedSet) {
                    throw new Error('Please select a valid instruction set.');
                }
                // Ensure content is parsed if string, or cast to InstructionSection[]
                // Assuming stored content matches the structure. 
                // Using 'any' cast for safety if types mismatch slightly at runtime
                selectedInstructions = typeof selectedSet.content === 'string'
                    ? JSON.parse(selectedSet.content)
                    : selectedSet.content;
            }

            if (!selectedInstructions || selectedInstructions.length === 0) {
                throw new Error('No instructions content found.');
            }

            const response = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instructions: selectedInstructions,
                    options: genOptions
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate course');
            }

            const data = await response.json();
            setGeneratedData(data);
            setIsGenerateModalOpen(false);
            setIsCreating(true); // Open the course builder with generated data
            showToast('Course generated successfully! Review and save it.', 'success');

        } catch (error) {
            console.error('Generation failed:', error);
            showToast(error instanceof Error ? error.message : 'Failed to generate course', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const hasInstructions = instructions.length > 0;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-bold">Project Courses</h3>
                    <p className="text-sm text-muted-foreground">Select existing training courses or create new ones for this project.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        disabled={!hasInstructions && savedInstructionSets.length === 0 && !isGenerateModalOpen} // Only disable if NOTHING is available and modal is closed. Inside modal we fetch.
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-200 border border-purple-500/30 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title={'Generate a course from your instructions'}
                    >
                        <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Generate with AI
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Course
                    </button>
                </div>
            </div>

            {/* AI Generation Modal */}
            {isGenerateModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Generate Course with AI</h3>
                                    <p className="text-sm text-muted-foreground">Create lessons & quizzes from instructions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsGenerateModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Source Selection */}
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                <button
                                    onClick={() => setInstructionSource('wizard')}
                                    disabled={!hasInstructions}
                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${instructionSource === 'wizard' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white disabled:opacity-30'}`}
                                >
                                    Current Project Instructions
                                </button>
                                <button
                                    onClick={() => setInstructionSource('saved')}
                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${instructionSource === 'saved' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    Load from Library
                                </button>
                            </div>

                            {/* Instructions Content Display */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[100px] flex flex-col justify-center">
                                {instructionSource === 'wizard' ? (
                                    <>
                                        <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                            <BookOpen className="w-4 h-4" />
                                            Based on {instructions.length} instruction section(s)
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {instructions.slice(0, 3).map(s => s.title).join(', ')}
                                            {instructions.length > 3 && ` and ${instructions.length - 3} more...`}
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Select Instruction Set</label>
                                            {isLoadingInstructions && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                                        </div>

                                        {savedInstructionSets.length > 0 ? (
                                            <div className="relative">
                                                <CustomSelect
                                                    name="instruction_set"
                                                    label="Instruction Set"
                                                    placeholder="Select saved instructions"
                                                    options={savedInstructionSets.map(s => ({ code: s.id, name: s.name }))}
                                                    value={selectedSavedId}
                                                    onChange={(val) => setSelectedSavedId(val)}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center italic">No saved instructions found.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Number of Lessons</label>
                                        <select
                                            value={genOptions.lessonCount}
                                            onChange={(e) => setGenOptions(prev => ({ ...prev, lessonCount: Number(e.target.value) }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500/50"
                                        >
                                            <option value={0}>Auto (recommended)</option>
                                            <option value={4}>4 lessons</option>
                                            <option value={6}>6 lessons</option>
                                            <option value={8}>8 lessons</option>
                                            <option value={10}>10 lessons</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Questions per Quiz</label>
                                        <select
                                            value={genOptions.questionsPerQuiz}
                                            onChange={(e) => setGenOptions(prev => ({ ...prev, questionsPerQuiz: Number(e.target.value) }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500/50"
                                        >
                                            <option value={3}>3 questions</option>
                                            <option value={4}>4 questions</option>
                                            <option value={5}>5 questions</option>
                                            <option value={6}>6 questions</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={genOptions.includeIntro}
                                            onChange={(e) => setGenOptions(prev => ({ ...prev, includeIntro: e.target.checked }))}
                                            className="w-4 h-4 accent-purple-500 rounded"
                                        />
                                        <span className="text-sm group-hover:text-white transition-colors">Include Introduction</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={genOptions.includeFinalAssessment}
                                            onChange={(e) => setGenOptions(prev => ({ ...prev, includeFinalAssessment: e.target.checked }))}
                                            className="w-4 h-4 accent-purple-500 rounded"
                                        />
                                        <span className="text-sm group-hover:text-white transition-colors">Final Assessment Quiz</span>
                                    </label>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-200">
                                <p>✨ AI will create explanatory lessons that synthesize your instructions, followed by quiz lessons to test comprehension.</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateCourse}
                                    disabled={isGenerating}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Course
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isCreating && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-7xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    {generatedData ? <><Sparkles className="w-5 h-5 text-purple-400" /> AI-Generated Course</> : 'Create New Course'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {generatedData ? 'Review the generated content, make any edits, then save.' : 'Add training material to one of your projects or create a global course.'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setGeneratedData(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <CourseBuilder
                                onSaveSuccess={handleSaveSuccess}
                                onCancel={() => {
                                    setIsCreating(false);
                                    setGeneratedData(null);
                                }}
                                initialGeneratedData={generatedData}
                            />
                        </div>
                    </div>
                </div>,
                document.body
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
