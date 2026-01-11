'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectTemplate, PROJECT_TEMPLATES } from '@/utils/templates';
import { TaskBuilder } from '@/components/builder/TaskBuilder';
import { TaskComponent } from '@/components/builder/types';
import { createProject, saveProjectDraft } from '../actions';
import { ChevronRight, ChevronLeft, Save, LayoutGrid, Settings2, MessageSquare, Image as ImageIcon, Box, Mic, Bot, BookOpen, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { InstructionsStep } from './steps/InstructionsStep';
import { CoursesStep } from './steps/CoursesStep';
import { InstructionSection, Course, Project } from '@/types/manual-types';
import CustomSelect from '@/components/CustomSelect';
import CustomDateInput from '@/components/CustomDateInput';

const PROJECT_TYPE_OPTIONS = [
    { code: 'text_classification', name: 'Text Classification' },
    { code: 'image_classification', name: 'Image Classification' },
    { code: 'image_bounding_box', name: 'Object Detection' },
    { code: 'sentiment_analysis', name: 'Sentiment Analysis' },
    { code: 'generation', name: 'Chatbot Evaluation (RLHF)' },
    { code: 'audio_transcription', name: 'Audio Transcription' },
    { code: 'video_tracking', name: 'Video Object Tracking' },
    { code: 'time_series', name: 'Time Series Anomaly' },
    { code: 'pdf_extraction', name: 'PDF Data Extraction' },
    { code: 'rlhf_pogo', name: 'Safe & Helpful RLHF' },
    { code: 'genomic_variant_analysis', name: 'Genomic Variant Analysis' },
];

const iconMap = {
    MessageSquare,
    Image: ImageIcon,
    Box,
    Mic,
    Bot,
    Dna
};

type Step = 'template' | 'instructions' | 'courses' | 'builder' | 'details';

interface ProjectCreationWizardProps {
    availableCourses: Course[];
    initialData?: Project | null;
}

export function ProjectCreationWizard({ availableCourses: initialCoursesList, initialData }: ProjectCreationWizardProps) {
    const [step, setStep] = useState<Step>(initialData ? 'instructions' : 'template');
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [components, setComponents] = useState<TaskComponent[]>(initialData?.template_schema || []);
    const [instructions, setInstructions] = useState<InstructionSection[]>(
        initialData?.guidelines ? JSON.parse(initialData.guidelines) : [
            { id: '1', title: 'General Guidelines', content: '# Welcome\n\nPlease follow these rules...' }
        ]
    );
    const [availableCourses, setAvailableCourses] = useState<Course[]>(initialCoursesList);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for "Details" step to enable auto-save
    const [details, setDetails] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || '',
        pay_rate: initialData?.pay_rate || '',
        max_task_time: initialData?.max_task_time ? initialData.max_task_time / 60 : 30,
        total_tasks: initialData?.total_tasks || 1000,
        extra_time_after_max: initialData?.extra_time_after_max ? initialData.extra_time_after_max / 60 : 0,
        review_task_time: initialData?.review_task_time ? initialData.review_task_time / 60 : 30,
        review_extra_time: initialData?.review_extra_time ? initialData.review_extra_time / 60 : 0,
        absolute_expiration_duration: initialData?.absolute_expiration_duration ? initialData.absolute_expiration_duration / 60 : 0,
        payment_mode: initialData?.payment_mode || 'hourly',
        pay_per_task: initialData?.pay_per_task || '',
        review_pay_per_task: initialData?.review_pay_per_task || '',
        start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        expected_end_date: initialData?.expected_end_date ? new Date(initialData.expected_end_date).toISOString().split('T')[0] : ''
    });

    const formRef = useRef<HTMLFormElement>(null);

    // Fetch initially linked courses for draft
    useEffect(() => {
        if (initialData) {
            const linked = initialCoursesList.filter(c => c.project_id === initialData.id).map(c => c.id);
            setSelectedCourseIds(linked);

            // Sync template if possible
            const template = PROJECT_TEMPLATES.find(t => t.type === initialData.type);
            if (template) setSelectedTemplate(template);
        }
    }, [initialData, initialCoursesList]);

    const handleAutoSave = useCallback(async () => {
        if (step === 'template' && !selectedTemplate && !initialData) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', details.name || selectedTemplate?.name || 'Untitled Project');
            formData.append('description', details.description || selectedTemplate?.description || '');
            formData.append('type', details.type || selectedTemplate?.type || 'text_classification');
            formData.append('guidelines', JSON.stringify(instructions));
            formData.append('template_schema', JSON.stringify(components));
            formData.append('course_ids', JSON.stringify(selectedCourseIds));
            formData.append('pay_rate', details.pay_rate);
            formData.append('max_task_time', details.max_task_time.toString());
            formData.append('total_tasks', details.total_tasks.toString());
            formData.append('extra_time_after_max', details.extra_time_after_max.toString());
            formData.append('review_task_time', details.review_task_time.toString());
            formData.append('review_extra_time', details.review_extra_time.toString());
            formData.append('absolute_expiration_duration', details.absolute_expiration_duration ? details.absolute_expiration_duration.toString() : '');
            formData.append('payment_mode', details.payment_mode);
            formData.append('pay_per_task', details.pay_per_task);
            formData.append('review_pay_per_task', details.review_pay_per_task);
            formData.append('start_date', details.start_date);
            formData.append('expected_end_date', details.expected_end_date);

            const savedDraft = await saveProjectDraft(formData, draftId || undefined);
            if (savedDraft) {
                setDraftId(savedDraft.id);
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [step, selectedTemplate, initialData, details, instructions, components, selectedCourseIds, draftId]);

    // Auto-save on step change
    const nextStep = () => {
        handleAutoSave();
        if (step === 'template' && selectedTemplate) setStep('instructions');
        else if (step === 'instructions') setStep('courses');
        else if (step === 'courses') setStep('builder');
        else if (step === 'builder') setStep('details');
    };

    const prevStep = () => {
        handleAutoSave();
        if (step === 'instructions') setStep('template');
        else if (step === 'courses') setStep('instructions');
        else if (step === 'builder') setStep('courses');
        else if (step === 'details') setStep('builder');
    };

    const goToStep = (targetStep: Step) => {
        // Prevent skipping directly to other steps if template isn't selected
        if (targetStep !== 'template' && !selectedTemplate && !initialData) return;

        handleAutoSave();
        setStep(targetStep);
    };

    const handleSelectTemplate = (template: ProjectTemplate) => {
        setSelectedTemplate(template);
        setComponents(template.schema);
        setDetails(prev => ({
            ...prev,
            name: `${template.name} Project`,
            description: template.description,
            type: template.type
        }));
        setStep('instructions');
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving draft...
                        </div>
                    ) : draftId ? (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Draft saved
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {steps.map((s, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isActive = i === currentStepIndex;
                    const canNavigate = i <= currentStepIndex || (selectedTemplate || initialData);

                    return (
                        <React.Fragment key={s.id}>
                            <button
                                type="button"
                                onClick={() => canNavigate && goToStep(s.id as Step)}
                                disabled={!canNavigate}
                                className={`flex items-center gap-2 transition-all outline-none ${isActive ? 'text-primary' : isCompleted ? 'text-white/80 hover:text-primary' : 'text-muted-foreground'} ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isActive ? 'border-primary bg-primary/10 text-primary scale-110 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' :
                                    isCompleted ? 'border-primary/50 bg-primary/5 text-primary' :
                                        'border-white/10'
                                    }`}>
                                    {i + 1}
                                </div>
                                <span className={`font-medium hidden md:inline transition-colors ${isActive ? 'font-bold' : ''}`}>
                                    {s.label}
                                </span>
                            </button>
                            {i < steps.length - 1 && (
                                <div className={`w-8 md:w-12 h-px transition-colors duration-500 ${i < currentStepIndex ? 'bg-primary' : 'bg-white/10'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
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
                        onCourseCreated={async (courseId) => {
                            try {
                                const { createClient } = await import('@/utils/supabase/client');
                                const supabase = createClient();
                                const { data: course } = await supabase
                                    .from('courses')
                                    .select('*')
                                    .eq('id', courseId)
                                    .single();

                                if (course) {
                                    setAvailableCourses(prev => [course as Course, ...prev]);
                                }
                            } catch (err) {
                                console.error('Error fetching new course:', err);
                            }
                        }}
                        instructions={instructions}
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
                    <form ref={formRef} action={createProject} className="glass-panel p-8 rounded-2x space-y-6">
                        <input type="hidden" name="template_schema" value={JSON.stringify(components)} />
                        <input type="hidden" name="guidelines" value={JSON.stringify(instructions)} />
                        <input type="hidden" name="course_ids" value={JSON.stringify(selectedCourseIds)} />
                        <input type="hidden" name="draft_id" value={draftId || ''} />

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
                                value={details.name}
                                onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Sentiment Analysis Dataset"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={details.description}
                                onChange={(e) => setDetails(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the goal of this project..."
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 !overflow-visible">
                            <div className="space-y-2 !overflow-visible">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Project Type</label>
                                <CustomSelect
                                    name="type"
                                    label="Project Type"
                                    placeholder="Select a type"
                                    options={PROJECT_TYPE_OPTIONS}
                                    defaultValue={details.type || selectedTemplate?.type || 'text_classification'}
                                    onChange={(val) => setDetails(prev => ({ ...prev, type: val }))}
                                />
                            </div>
                            {/* Removed old pay rate input to move it to Payment Settings section */}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Max Task Time (min)</label>
                                <input
                                    name="max_task_time"
                                    type="number"
                                    value={details.max_task_time}
                                    onChange={(e) => setDetails(prev => ({ ...prev, max_task_time: Number(e.target.value) }))}
                                    placeholder="30"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Total Tasks</label>
                                <input
                                    name="total_tasks"
                                    type="number"
                                    value={details.total_tasks}
                                    onChange={(e) => setDetails(prev => ({ ...prev, total_tasks: Number(e.target.value) }))}
                                    placeholder="1000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Project Timing */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h4 className="font-bold text-lg">Project Schedule</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Start Date</label>
                                    <CustomDateInput
                                        name="start_date"
                                        defaultValue={details.start_date}
                                        onChange={(val) => setDetails(prev => ({ ...prev, start_date: val }))}
                                    />
                                    <p className="text-xs text-muted-foreground">When the project is scheduled to begin.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Expected End Date</label>
                                    <CustomDateInput
                                        name="expected_end_date"
                                        defaultValue={details.expected_end_date}
                                        onChange={(val) => setDetails(prev => ({ ...prev, expected_end_date: val }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Target completion date for all tasks.</p>
                                </div>
                            </div>
                        </div>

                        {/* Timing Configuration */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h4 className="font-bold text-lg">Task Timing</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Extra Time (Overtime)</label>
                                    <input
                                        name="extra_time_after_max"
                                        type="number"
                                        value={details.extra_time_after_max}
                                        onChange={(e) => setDetails(prev => ({ ...prev, extra_time_after_max: Number(e.target.value) }))}
                                        placeholder="0 (minutes)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                    />
                                    <p className="text-xs text-muted-foreground">Additional time allowed after safe task time expires.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Absolute Expiration (min)</label>
                                    <input
                                        name="absolute_expiration_duration"
                                        type="number"
                                        value={details.absolute_expiration_duration || ''}
                                        onChange={(e) => setDetails(prev => ({ ...prev, absolute_expiration_duration: Number(e.target.value) }))}
                                        placeholder="60 (minutes)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                    />
                                    <p className="text-xs text-muted-foreground">Force expire task after X minutes from start, regardless of activity.</p>
                                </div>
                            </div>
                        </div>

                        {/* Review Configuration */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h4 className="font-bold text-lg">Review Configuration</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Review Task Time (min)</label>
                                    <input
                                        name="review_task_time"
                                        type="number"
                                        value={details.review_task_time}
                                        onChange={(e) => setDetails(prev => ({ ...prev, review_task_time: Number(e.target.value) }))}
                                        placeholder="30"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Review Extra Time (min)</label>
                                    <input
                                        name="review_extra_time"
                                        type="number"
                                        value={details.review_extra_time}
                                        onChange={(e) => setDetails(prev => ({ ...prev, review_extra_time: Number(e.target.value) }))}
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Configuration Update */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h4 className="font-bold text-lg">Payment Settings</h4>
                            <div className="grid grid-cols-2 gap-6 !overflow-visible">
                                <div className="space-y-2 !overflow-visible">
                                    <label className="text-sm font-bold uppercase text-muted-foreground">Payment Mode</label>
                                    <CustomSelect
                                        name="payment_mode"
                                        label="Payment Mode"
                                        placeholder="Select mode"
                                        options={[
                                            { code: 'hourly', name: 'Hourly Rate' },
                                            { code: 'task', name: 'Pay Per Task' }
                                        ]}
                                        defaultValue={details.payment_mode}
                                        onChange={(val) => setDetails(prev => ({ ...prev, payment_mode: val as 'hourly' | 'task' }))}
                                    />
                                </div>
                                {details.payment_mode === 'hourly' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase text-muted-foreground">Hourly Rate</label>
                                        <input
                                            name="pay_rate"
                                            value={details.pay_rate}
                                            onChange={(e) => setDetails(prev => ({ ...prev, pay_rate: e.target.value }))}
                                            placeholder="€15.00 / hr"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-muted-foreground">Annotator Pay Per Task</label>
                                            <input
                                                name="pay_per_task"
                                                value={details.pay_per_task}
                                                onChange={(e) => setDetails(prev => ({ ...prev, pay_per_task: e.target.value }))}
                                                placeholder="€0.50 / task"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-muted-foreground">Reviewer Pay Per Task</label>
                                            <input
                                                name="review_pay_per_task"
                                                value={details.review_pay_per_task}
                                                onChange={(e) => setDetails(prev => ({ ...prev, review_pay_per_task: e.target.value }))}
                                                placeholder="€0.25 / task"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                )}
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
                                {initialData ? 'Update & Launch' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

