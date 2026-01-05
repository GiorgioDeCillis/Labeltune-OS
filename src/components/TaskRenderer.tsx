'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TaskComponent } from '@/components/builder/types';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Timer, AlertTriangle, Clock } from 'lucide-react';
import { submitTask, updateTaskTimer, skipTask, expireTask } from '@/app/dashboard/tasks/actions';
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
    RubricTable
} from '@/components/builder/Renderers';

export function TaskRenderer({
    schema,
    taskId,
    initialData,
    isReadOnly = false,
    maxTime,
    initialTimeSpent = 0
}: {
    schema: TaskComponent[],
    taskId: string,
    initialData?: any,
    isReadOnly?: boolean,
    maxTime?: number | null,
    initialTimeSpent?: number
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seconds, setSeconds] = useState(initialTimeSpent);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Max time logic
    useEffect(() => {
        if (!isReadOnly && maxTime) {
            // Soft limit: Show warning
            if (seconds === maxTime) {
                setShowTimeoutWarning(true);
            }

            // Hard limit: Double time -> Force expire
            if (seconds >= maxTime * 2) {
                // Clear timer to prevent multiple calls
                if (timerRef.current) clearInterval(timerRef.current);

                // Force expire
                handleExpire();
            }
        }
    }, [seconds, maxTime, isReadOnly]);

    const handleExpire = async () => {
        setIsSubmitting(true); // Block interaction
        try {
            await expireTask(taskId);
        } catch (error) {
            console.error('Failed to expire task:', error);
            // Even if it fails, redirect user
            router.push('/dashboard/tasks');
        }
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            await skipTask(taskId);
        } catch (error) {
            console.error('Failed to skip task:', error);
        }
    };

    // ... existing timer logic ...

    useEffect(() => {
        if (!isReadOnly) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isReadOnly]);

    // Autosave timer every 5 seconds
    // Keep track of latest seconds in a ref to use inside interval without resetting it
    const secondsRef = useRef(seconds);
    useEffect(() => {
        secondsRef.current = seconds;
    }, [seconds]);

    // Autosave timer every 5 seconds
    useEffect(() => {
        if (isReadOnly) return;

        const saveInterval = setInterval(() => {
            // Use the ref value to get current time
            if (secondsRef.current > initialTimeSpent) {
                updateTaskTimer(taskId, secondsRef.current);
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [isReadOnly, taskId, initialTimeSpent]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    // ... handle change ...
    const handleChange = (id: string, value: any) => {
        if (isReadOnly) return;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            await submitTask(taskId, formData, seconds);
            router.push('/dashboard/tasks');
            router.refresh();
        } catch (error) {
            console.error('Error submitting task:', error);
            alert('Failed to submit task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mock data for objects
    const taskData = initialData || {};

    return (
        <div className="flex flex-col h-full relative">
            {/* Timeout Warning Modal */}
            {showTimeoutWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-yellow-500 blur-[8px] rounded-full"></div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 mb-2">
                                <Timer className="w-8 h-8 text-yellow-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white">Time Limit Reached</h3>

                            <p className="text-muted-foreground">
                                You have exceeded the allocated time for this task.
                                <br />
                                <span className="text-yellow-500 font-bold block mt-2">
                                    Additional time will not be paid.
                                </span>
                            </p>

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

                            <p className="text-xs text-white/20 pt-2">
                                Task will expire automatically in {maxTime ? formatTime(maxTime) : 'a while'}.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex items-center justify-between mb-4 bg-white/5 p-3 rounded-lg border border-white/10 transition-colors ${seconds > (maxTime || Infinity) ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
                <div className="flex items-center gap-2 text-primary font-mono text-sm">
                    {seconds > (maxTime || Infinity) ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                        <Timer className="w-4 h-4" />
                    )}
                    <span className={seconds > (maxTime || Infinity) ? 'text-yellow-500' : ''}>
                        Time spent: {formatTime(seconds)}
                    </span>
                    {maxTime && (
                        <span className="opacity-50">
                            / {formatTime(maxTime)}
                        </span>
                    )}
                </div>
                {seconds > (maxTime || Infinity) && (
                    <div className="text-xs font-bold text-yellow-500 px-2 py-0.5 bg-yellow-500/10 rounded border border-yellow-500/20 animate-pulse">
                        OVERTIME (UNPAID)
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar p-1">
                {schema.map((component) => {
                    // Objects
                    if (component.type === 'Image') return <ImageObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'Text') return <TextObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'Audio') return <AudioObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'Header') return <HeaderComponent key={component.id} component={component} />;
                    if (component.type === 'Video') return <VideoObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'TimeSeries') return <TimeSeriesObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'PDF') return <PDFObject key={component.id} component={component} data={taskData} />;
                    if (component.type === 'MultiMessage') return <MultiMessageObject key={component.id} component={component} data={taskData} />;

                    // Pogo Workflow Components
                    if (component.type === 'InstructionBlock') return <InstructionBlock key={component.id} component={component} data={taskData} />;
                    if (component.type === 'RequirementPanel') return <RequirementPanel key={component.id} component={component} />;
                    if (component.type === 'SideBySide') return <SideBySideLayout key={component.id} component={component} data={taskData} />;
                    if (component.type === 'RubricTable') return <RubricTable key={component.id} component={component} />;

                    // Controls
                    const value = formData[component.name] || formData[component.id];
                    // Note: Label Studio uses 'name' for result keys. We should ideally use component.name.
                    // Fallback to ID if name not set (though we default name now).

                    const onChange = (val: any) => handleChange(component.name || component.id, val);

                    if (component.type === 'Choices') return <ChoicesControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'Rating') return <RatingControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'TextArea') return <TextAreaControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'Labels' || component.type === 'RectangleLabels') return <ImageLabelsControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'RubricScorer') return <RubricScorerControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'Ranking') return <RankingControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;
                    if (component.type === 'Feedback') return <FeedbackControl key={component.id} component={component} value={value} onChange={onChange} readOnly={isReadOnly} />;

                    return <div key={component.id} className="text-red-400 text-xs">Unsupported component: {component.type}</div>;
                })}
            </div>

            {!isReadOnly && (
                <div className="pt-6 border-t border-white/5 space-y-3 mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit & Next
                    </button>
                    <button
                        onClick={() => handleSkip()}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Skip
                    </button>
                </div>
            )}
        </div>
    );
}

// Deprecated old helper removed as we use component renderers now
