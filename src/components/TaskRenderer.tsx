'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TaskComponent } from '@/components/builder/types';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Timer, AlertTriangle, Clock } from 'lucide-react';
import { submitTask, updateTaskTimer, skipTask, expireTask } from '@/app/dashboard/tasks/actions';
import { startTasking } from '@/app/dashboard/projects/actions';
import { useToast } from '@/components/Toast';
import { TaskSubmissionSuccess } from '@/components/dashboard/TaskSubmissionSuccess';
import {
    ImageObject,
    TextObject,
    AudioObject,
    HeaderComponent,
    ChoicesControl,
    RatingControl,
    TextAreaControl,
    ImageLabelsControl,
    VideoObject,
    TimeSeriesObject,
    PDFObject,
    MultiMessageObject,
    InstructionBlock,
    RequirementPanel,
    SideBySideLayout,
    RubricScorerControl,
    RankingControl,
    FeedbackControl,
    RubricTable,
    HyperTextObject,
    ViewLayout,
    AudioRecorderControl,
    ChecklistControl,
    AccordionChoicesControl,
    AIResponseGeneratorObject,
    VideoTimelineControl,
    AudioSpectrogramControl
} from '@/components/builder/Renderers';

export function TaskRenderer({
    schema,
    taskId,
    initialData,
    isReadOnly = false,
    maxTime,
    extraTime = 0,
    absoluteExpiration = 0,
    startedAt,
    initialTimeSpent = 0,
    projectId,
    initialEarnings = 0,
    taskStatus
}: {
    schema: TaskComponent[],
    taskId: string,
    initialData?: any,
    isReadOnly?: boolean,
    maxTime?: number | null,
    extraTime?: number,
    absoluteExpiration?: number,
    startedAt?: string | null,
    initialTimeSpent?: number,
    projectId: string,
    initialEarnings?: number,
    taskStatus?: string
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seconds, setSeconds] = useState(initialTimeSpent);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [expirationReason, setExpirationReason] = useState<'task' | 'absolute' | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Initialize submission results if task is already completed
    const [submissionResults, setSubmissionResults] = useState<{ earnings: number; timeSpent: number; projectId: string } | null>(
        taskStatus === 'completed' || taskStatus === 'approved' ? {
            earnings: initialEarnings,
            timeSpent: initialTimeSpent,
            projectId: projectId
        } : null
    );

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToast();

    // Max time logic
    useEffect(() => {
        if (!isReadOnly) {
            // 1. Soft warning at maxTime
            if (maxTime && seconds === maxTime) {
                setShowTimeoutWarning(true);
            }

            // 2. Hard limit: maxTime + extraTime
            if (maxTime && seconds >= (maxTime + extraTime)) {
                if (timerRef.current) clearInterval(timerRef.current);
                setExpirationReason('task');
                setIsExpired(true);
                handleExpire();
                return;
            }

            // 3. Absolute expiration check (Hard limit since task reservation)
            if (absoluteExpiration && startedAt) {
                const startTime = new Date(startedAt).getTime();
                const now = new Date().getTime();
                const diffSec = (now - startTime) / 1000;

                if (diffSec >= absoluteExpiration) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setExpirationReason('absolute');
                    setIsExpired(true);
                    handleExpire();
                }
            }
        }
    }, [seconds, maxTime, extraTime, absoluteExpiration, startedAt, isReadOnly]);

    const handleExpire = async () => {
        // Just notify server, don't block UI here (modal blocks it)
        try {
            await expireTask(taskId);
        } catch (error) {
            console.error('Failed to expire task:', error);
        }
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            await skipTask(taskId);
            router.push('/dashboard/tasks'); // Or logic to find next task
        } catch (error) {
            console.error('Failed to skip task:', error);
        }
    };

    // ... existing timer logic ...

    useEffect(() => {
        if (!isReadOnly && !submissionResults) { // Stop timer on success
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isReadOnly, submissionResults]); // Added submissionResults dependency

    // Autosave timer every 5 seconds
    // Keep track of latest seconds in a ref to use inside interval without resetting it
    const secondsRef = useRef(seconds);
    useEffect(() => {
        secondsRef.current = seconds;
    }, [seconds]);

    // Autosave timer every 5 seconds
    useEffect(() => {
        if (isReadOnly || submissionResults) return; // Stop autosave on success

        const saveInterval = setInterval(() => {
            // Use the ref value to get current time
            if (secondsRef.current > initialTimeSpent) {
                updateTaskTimer(taskId, secondsRef.current);
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [isReadOnly, taskId, initialTimeSpent, submissionResults]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    // Global listener for automatic transcription autofill
    useEffect(() => {
        if (isReadOnly) return;

        const handleTranscription = (e: any) => {
            const { text } = e.detail;
            if (!text) return;

            // Find if there is a transcription or translation field to populate
            // We check both component.name and component.id (though name is preferred)
            const targetComponent = schema.find(c =>
                c.type === 'TextArea' &&
                (c.name?.toLowerCase().includes('transcription') ||
                    c.name?.toLowerCase().includes('translation'))
            );

            if (targetComponent) {
                const targetId = targetComponent.name || targetComponent.id;
                // Only populate if empty or if user hasn't typed significantly?
                // For now, let's just populate it to fulfill the "facilitate work" requirement.
                setFormData((prev: any) => ({
                    ...prev,
                    [targetId]: text
                }));
            }
        };

        window.addEventListener('audio-transcription-complete', handleTranscription);
        return () => window.removeEventListener('audio-transcription-complete', handleTranscription);
    }, [schema, isReadOnly]);

    // ... handle change ...
    const handleChange = (id: string, value: any) => {
        if (isReadOnly) return;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };


    const confirmSubmit = () => {
        setShowConfirm(true);
    }

    const handleFinalSubmit = async () => {
        setShowConfirm(false);
        setIsSubmitting(true);

        try {
            const result = await submitTask(taskId, formData, seconds);

            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false); // Only re-enable if error, keep disabled on success while transitioning
                return;
            }

            if (result?.data) {
                setSubmissionResults(result.data as any);
                // Don't route push immediately, show success screen
            } else {
                // Fallback if legacy response
                showToast('Task submitted successfully', 'success');
                router.push('/dashboard');
            }

        } catch (error) {
            console.error('Error submitting task:', error);
            showToast('Failed to submit task. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    const handleNextTask = async () => {
        const targetProjectId = submissionResults?.projectId || projectId;

        if (targetProjectId) {
            try {
                await startTasking(targetProjectId);
            } catch (error: any) {
                if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
                    throw error;
                }
                console.error("Error starting next task:", error);
                router.push(`/dashboard/projects/${targetProjectId}`);
            }
        } else {
            router.push('/dashboard');
        }
    }

    // Mock data for objects
    const taskData = initialData || {};

    // Validation Logic
    const validateTask = (components: TaskComponent[], data: any): boolean => {
        for (const component of components) {
            // Check children recursively
            if (component.children) {
                if (!validateTask(component.children, data)) return false;
            }

            // Skip if not required
            if (!component.required) continue;

            // Check if value exists
            const value = data[component.name] || data[component.id];

            // Specific validation by type
            if (component.type === 'RubricScorer') {
                if (!component.rubricCriteria) continue;
                // Check if all criteria have a score
                const scores = value || {};
                const allScored = component.rubricCriteria.every(
                    (criterion) => scores[criterion.id] && scores[criterion.id] !== 'none' // assuming 'none' means zero points but still scored? Or is it explicit 'none'?
                    // Actually, based on Renderers.tsx, 'none' IS a valid score (0 pts).
                    // So we just need to check if the key exists in the object.
                    // But wait, if they haven't touched it, it's undefined.
                );
                // Let's refine: In Renderers, handleScore sets the value.
                // So we need to check if every criterion ID is present in the value object.
                const isComplete = component.rubricCriteria.every(c => scores[c.id] !== undefined);
                if (!isComplete) return false;

            } else if (component.type === 'Checklist' || component.type === 'AccordionChoices') {
                // Determine if valid based on if it's an object (checklist) or array (choices)
                // Checklist: value is { "item_val": true, ... }
                // AccordionChoices: value is string or string[]

                if (component.type === 'Checklist') {
                    // Check if ALL items are checked (since we are in the required check block)
                    const checked = value || {};
                    const opts = component.options || [];
                    console.log('DEBUG CHECKLIST VALIDATION:', {
                        id: component.id,
                        totalOptions: opts.length,
                        checkedState: checked
                    });

                    if (opts.length > 0) {
                        const allChecked = opts.every(opt => checked[opt.value] === true);
                        console.log('DEBUG CHECKLIST RESULT:', { allChecked });
                        if (!allChecked) return false;
                    } else {
                        // Fallback: Check if at least one is true
                        console.warn('Checklist Validation: No options found in schema for component:', component.id);
                        const hasChecked = Object.values(checked).some(v => v === true);
                        if (!hasChecked) return false;
                    }
                } else {
                    // AccordionChoices / Choices
                    const selected = Array.isArray(value) ? value : (value ? [value] : []);
                    if (selected.length === 0) return false;
                }

            } else if (component.type === 'AudioRecorder') {
                if (!value) return false;
            } else {
                // Standard checks (Text, Rating, etc.)
                if (value === undefined || value === null || value === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
            }
        }
        return true;
    };

    // Memoize validation status to avoid expensive recalculations on every render
    // although for small forms it doesn't matter much.
    // We need to re-validate whenever formData changes.
    const isTaskValid = React.useMemo(() => {
        return validateTask(schema, formData);
    }, [schema, formData]);


    return (
        <div className="relative pb-32">
            {/* Blocking Expiration Modal */}
            {isExpired && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-[#121212] border border-red-500/20 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>

                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Task Expired</h2>
                        <p className="text-muted-foreground mb-4 text-lg">
                            {expirationReason === 'absolute'
                                ? "The reservation period for this task has expired."
                                : "The maximum allowed work time for this task has been exceeded."}
                        </p>
                        <p className="text-sm text-red-400/60 mb-8 lowercase tracking-tight">
                            {expirationReason === 'absolute'
                                ? "Absolute duration was set to " + formatTime(absoluteExpiration)
                                : "Task work limit + extra time was " + formatTime(maxTime! + extraTime)}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-all font-bold"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleNextTask}
                                className="py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all font-bold shadow-lg shadow-red-500/20"
                            >
                                Next Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeout Warning Modal (Soft Limit) - Only show if NOT expired */}
            {showTimeoutWarning && !isExpired && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-yellow-500 blur-[8px] rounded-full"></div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 mb-2">
                                <Timer className="w-8 h-8 text-yellow-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white">Time Limit Reached</h3>

                            <div className="text-muted-foreground space-y-2">
                                <p>You have reached the primary time limit.</p>
                                {extraTime > 0 ? (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-2">
                                        <p className="text-yellow-500 text-sm font-bold">
                                            Extra time available: {formatTime(extraTime)}
                                        </p>
                                        <p className="text-[10px] opacity-70">
                                            Warning: This extra time will not be paid.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-yellow-500 font-bold block mt-2">
                                        Additional time will not be paid.
                                    </p>
                                )}
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={() => handleSkip()}
                                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-all font-medium"
                                >
                                    Skip Task
                                </button>
                                <button
                                    onClick={() => setShowTimeoutWarning(false)}
                                    className="px-4 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                >
                                    Continue
                                </button>
                            </div>

                            {(maxTime || absoluteExpiration) && (
                                <p className="text-xs text-white/20 pt-2">
                                    Task will expire in {
                                        formatTime(
                                            Math.min(
                                                (maxTime ? (maxTime + extraTime - seconds) : Infinity),
                                                (absoluteExpiration && startedAt ? (absoluteExpiration - (Date.now() - new Date(startedAt).getTime()) / 1000) : Infinity)
                                            )
                                        )
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-2">Submit Task?</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to submit this task? You won't be able to edit it afterwards.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Screen Overlay */}
            {submissionResults && (
                <TaskSubmissionSuccess
                    earnings={submissionResults.earnings}
                    timeSpent={submissionResults.timeSpent}
                    projectId={submissionResults.projectId}
                    onDashboard={() => router.push('/dashboard')}
                    onNextTask={handleNextTask}
                />
            )}


            <div className="space-y-8 pr-2">
                {schema.map((component) => renderComponent(component, taskData, formData, handleChange, isReadOnly))}
            </div>

            {!isReadOnly && (
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 mt-4 mb-20">
                    <button
                        onClick={() => handleSkip()}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Skip
                    </button>
                    <button
                        onClick={confirmSubmit}
                        disabled={isSubmitting || !isTaskValid}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        title={!isTaskValid ? "Please fill all required fields" : ""}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit & Next
                    </button>
                </div>
            )}
        </div>
    );
}

// Helper for recursive rendering
function renderComponent(
    component: TaskComponent,
    taskData: any,
    formData: any,
    handleChange: (id: string, value: any) => void,
    isReadOnly: boolean
) {
    // Objects
    if (component.type === 'Image') return <ImageObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'Text') return <TextObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'Audio') return <AudioObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'Header') return <HeaderComponent key={component.id} component={component} />;
    if (component.type === 'HyperText') return <HyperTextObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'Video') return <VideoObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'TimeSeries') return <TimeSeriesObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'PDF') return <PDFObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'MultiMessage') return <MultiMessageObject key={component.id} component={component} data={taskData} />;
    if (component.type === 'AIResponseGenerator') return <AIResponseGeneratorObject key={component.id} component={component} readOnly={isReadOnly} />;

    // Layout
    if (component.type === 'View') {
        return (
            <ViewLayout key={component.id} component={component}>
                {component.children?.map(child => renderComponent(child, taskData, formData, handleChange, isReadOnly))}
            </ViewLayout>
        );
    }

    // Pogo Workflow Components
    if (component.type === 'InstructionBlock') return <InstructionBlock key={component.id} component={component} data={taskData} />;
    if (component.type === 'RequirementPanel') return <RequirementPanel key={component.id} component={component} />;
    if (component.type === 'SideBySide') return <SideBySideLayout key={component.id} component={component} data={taskData} />;
    if (component.type === 'RubricTable') return <RubricTable key={component.id} component={component} />;

    // Controls
    const value = formData[component.name] || formData[component.id];
    const onChange = (val: any) => handleChange(component.name || component.id, val);

    if (component.type === 'Choices') return <ChoicesControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'Rating') return <RatingControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'TextArea') return <TextAreaControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'Labels' ||
        component.type === 'RectangleLabels' ||
        component.type === 'PolygonLabels' ||
        component.type === 'BrushLabels' ||
        component.type === 'KeypointLabels' ||
        component.type === 'EllipseLabels' ||
        component.type === 'RelationLabels'
    ) return <ImageLabelsControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} data={taskData} />;

    if (component.type === 'VideoTimeline') return <VideoTimelineControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} data={taskData} />;
    if (component.type === 'AudioSpectrogram') return <AudioSpectrogramControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} data={taskData} />;
    if (component.type === 'RubricScorer') return <RubricScorerControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'Ranking') return <RankingControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'Feedback') return <FeedbackControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'AudioRecorder') return <AudioRecorderControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'Checklist') return <ChecklistControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
    if (component.type === 'AccordionChoices') return <AccordionChoicesControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;

    return <div key={component.id} className="text-red-400 text-xs">Unsupported component: {component.type}</div>;
}
