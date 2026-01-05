'use client';

import React, { useState } from 'react';
import { TaskComponent } from '@/components/builder/types';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Timer } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { submitTask } from '@/app/dashboard/tasks/actions';
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
    maxTime
}: {
    schema: TaskComponent[],
    taskId: string,
    initialData?: any,
    isReadOnly?: boolean,
    maxTime?: number | null
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const supabase = createClient();

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

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    // In a real Label Studio implementation, Objects are rendered once and controls might attach to them.
    // For this simplified version, we just render everything in order.
    // But we need to make sure "data" (the object content) is passed to Object components.

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

    // Mock data for objects if not provided (usually comes from task.payload column)
    const taskData = initialData || {}; // This line is kept as per the user's instruction, even if it seems to conflict with the comment.
    // In a real app we'd fetch the task data. For now assuming initialData or some context has it.
    // Hack: if initialData has '$image' keys etc, use them.
    // The user's instruction had a malformed line here, so I'm interpreting it as keeping the original `initialData` assignment.
    // If the intention was to use `task?.payload`, please provide a clearer instruction.

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-primary font-mono text-sm">
                    <Timer className="w-4 h-4" />
                    <span>Time spent: {formatTime(seconds)}</span>
                    {maxTime && (
                        <span className="opacity-50">
                            / {formatTime(maxTime)}
                        </span>
                    )}
                </div>
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
                        onClick={() => router.push('/dashboard/tasks')}
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
