'use client';

import React, { useState } from 'react';
import { ProjectTemplate, PROJECT_TEMPLATES } from '@/utils/templates';
import { TaskBuilder } from '@/components/builder/TaskBuilder';
import { TaskComponent } from '@/components/builder/types';
import { createProject } from '../actions';
import { ChevronRight, ChevronLeft, Save, LayoutGrid, Settings2, MessageSquare, Image as ImageIcon, Box, Mic, Bot } from 'lucide-react';

const iconMap = {
    MessageSquare,
    Image: ImageIcon,
    Box,
    Mic,
    Bot
};

import { ProjectTemplate, PROJECT_TEMPLATES } from '@/utils/templates';
import { TaskBuilder } from '@/components/builder/TaskBuilder';
import { TaskComponent } from '@/components/builder/types';
import { createProject } from '../actions';
import { ChevronRight, ChevronLeft, Save, LayoutGrid, Settings2, MessageSquare, Image as ImageIcon, Box, Mic, Bot, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { InstructionsStep, InstructionSection } from './steps/InstructionsStep';
import { CoursesStep } from './steps/CoursesStep';
import { Course } from '@/types/manual-types';

const iconMap = {
    MessageSquare,
    Image: ImageIcon,
    Box,
    Mic,
    Bot
};

type Step = 'template' | 'instructions' | 'courses' | 'builder' | 'details';

interface ProjectCreationWizardProps {
    availableCourses: Course[];
}

export function ProjectCreationWizard({ availableCourses: initialCourses }: ProjectCreationWizardProps) {
    const [step, setStep] = useState<Step>('template');
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [components, setComponents] = useState<TaskComponent[]>([]);
    const [instructions, setInstructions] = useState<InstructionSection[]>([
        { id: '1', title: 'General Guidelines', content: '# Welcome\n\nPlease follow these rules...' }
    ]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>(initialCourses);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const handleSelectTemplate = (template: ProjectTemplate) => {
        setSelectedTemplate(template);
        setComponents(template.schema);
        setStep('instructions');
    };

    const nextStep = () => {
        if (step === 'template' && selectedTemplate) setStep('instructions');
        else if (step === 'instructions') setStep('courses');
        else if (step === 'courses') setStep('builder');
        else if (step === 'builder') setStep('details');
    };

    const prevStep = () => {
        if (step === 'instructions') setStep('template');
        else if (step === 'courses') setStep('instructions');
        else if (step === 'builder') setStep('courses');
        else if (step === 'details') setStep('builder');
    };

    const steps = [
        { id: 'template', label: 'Template', icon: LayoutGrid },
        { id: 'instructions', label: 'Instructions', icon: FileText },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'builder', label: 'Builder', icon: Settings2 },
        { id: 'details', label: 'Details', icon: Save },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <div className="space-y-8">
            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className={`flex items-center gap-2 ${i === currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${i <= currentStepIndex ? 'border-primary bg-primary/10 text-primary' : 'border-white/10'
                                }`}>
                                {i + 1}
                            </div>
                            <span className="font-medium hidden md:inline">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && <div className={`w-8 md:w-12 h-px ${i < currentStepIndex ? 'bg-primary/50' : 'bg-white/10'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 'template' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROJECT_TEMPLATES.map((t) => {
                        const Icon = (iconMap as any)[t.icon] || LayoutGrid;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleSelectTemplate(t)}
                                className="glass-panel p-6 rounded-2xl text-left hover:border-primary/50 transition-all group relative overflow-hidden h-full flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon className="w-24 h-24" />
                                </div>
                                <Icon className="w-10 h-10 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                                <p className="text-muted-foreground text-sm flex-1">{t.description}</p>
                                <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Use this template <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>
                        );
                    })}
                    {/* Empty Template */}
                    <button
                        onClick={() => {
                            setSelectedTemplate(null);
                            setComponents([]);
                            setStep('instructions');
                        }}
                        className="glass-panel p-6 rounded-2xl text-left border-dashed border-2 border-white/10 hover:border-primary/50 transition-all group flex flex-col h-full"
                    >
                        <Settings2 className="w-10 h-10 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                        <h3 className="text-xl font-bold mb-2">Blank Project</h3>
                        <p className="text-muted-foreground text-sm flex-1">Start from scratch and build your own workflow.</p>
                        <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Start empty <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            )}

            {step === 'instructions' && (
                <div className="space-y-6">
                    <InstructionsStep sections={instructions} onChange={setInstructions} />
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                        <button onClick={prevStep} className="px-6 py-2 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition-all flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" /> Back to Templates
                        </button>
                        <button onClick={nextStep} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                            Next: Training Courses <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 'courses' && (
                <div className="space-y-6">
                    <CoursesStep
                        availableCourses={availableCourses}
                        selectedCourseIds={selectedCourseIds}
                        onToggleCourse={(id) => setSelectedCourseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                        onCourseCreated={(course) => setAvailableCourses(prev => [...prev, course])}
                    />
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                        <button onClick={prevStep} className="px-6 py-2 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition-all flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" /> Back to Instructions
                        </button>
                        <button onClick={nextStep} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                            Next: Task Builder <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 'builder' && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <button onClick={prevStep} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h3 className="font-bold">Customize Task Workflow</h3>
                                <p className="text-sm text-muted-foreground">Drag and drop components to design your labeling interface.</p>
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            Next: Project Details
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-[650px] overflow-hidden">
                        <TaskBuilder
                            initialComponents={components}
                            onComponentsChange={setComponents}
                            showSaveButton={false}
                        />
                    </div>
                </div>
            )}

            {step === 'details' && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form action={createProject} className="glass-panel p-8 rounded-2x space-y-6">
                        <input type="hidden" name="template_schema" value={JSON.stringify(components)} />
                        <input type="hidden" name="guidelines" value={JSON.stringify(instructions)} />
                        <input type="hidden" name="course_ids" value={JSON.stringify(selectedCourseIds)} />

                        <div className="flex items-center gap-4 mb-6">
                            <button type="button" onClick={prevStep} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">Project Details</h3>
                                <p className="text-muted-foreground text-sm">Fill in the basic information for your new campaign.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name</label>
                            <input
                                name="name"
                                required
                                defaultValue={selectedTemplate?.name ? `${selectedTemplate.name} Project` : ''}
                                placeholder="e.g. Sentiment Analysis Dataset"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                defaultValue={selectedTemplate?.description}
                                placeholder="Describe the goal of this project..."
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Project Type</label>
                                <select
                                    name="type"
                                    defaultValue={selectedTemplate?.type || 'text_classification'}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value="text_classification">Text Classification</option>
                                    <option value="image_bounding_box">Image Bounding Box</option>
                                    <option value="sentiment_analysis">Sentiment Analysis</option>
                                    <option value="generation">Generation (RLHF)</option>
                                    <option value="audio_transcription">Audio Transcription</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Pay Rate</label>
                                <input
                                    name="pay_rate"
                                    placeholder="$15.00 / hr"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                Ready to Launch
                            </div>
                            <p className="text-xs text-muted-foreground">
                                You have defined <strong>{instructions.length}</strong> instruction sections and linked <strong>{selectedCourseIds.length}</strong> training courses.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <button type="submit" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                <Save className="w-5 h-5" />
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

