'use client';

import React, { useState } from 'react';
import { TaskComponent } from '@/components/builder/types';
import { useRouter } from 'next/navigation';
import { Loader2, ThumbsUp, ThumbsDown, Timer, Star, MessageSquare } from 'lucide-react';
import { approveTask, rejectTask, updateReviewTimer } from '@/app/dashboard/review/actions';
import { useEffect, useRef } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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

import { useToast } from '@/components/Toast';

import { startReviewing } from '@/app/dashboard/projects/actions';
import { TaskSubmissionSuccess } from '@/components/dashboard/TaskSubmissionSuccess';

export function ReviewTaskRenderer({
    schema,
    taskId,
    initialData,
    initialTimeSpent = 0,
    projectId,
    initialEarnings = 0,
    taskStatus
}: {
    schema: TaskComponent[],
    taskId: string,
    initialData?: any,
    initialTimeSpent?: number,
    projectId: string,
    initialEarnings?: number,
    taskStatus?: string
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [seconds, setSeconds] = useState(initialTimeSpent);
    const [feedback, setFeedback] = useState('');

    const isReadOnly = taskStatus === 'approved' || taskStatus === 'completed' || taskStatus === 'rejected';

    // Initialize submission results if task is already approved
    const [submissionResults, setSubmissionResults] = useState<{ earnings: number; timeSpent: number; projectId: string } | null>(
        taskStatus === 'approved' ? {
            earnings: initialEarnings,
            timeSpent: initialTimeSpent,
            projectId: projectId
        } : null
    );

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { showToast } = useToast();
    const router = useRouter();
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
    }>({ isOpen: false, type: null });

    // Timer Logic
    useEffect(() => {
        if (!submissionResults) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [submissionResults]);

    // Autosave timer every 5 seconds
    const secondsRef = useRef(seconds);
    useEffect(() => {
        secondsRef.current = seconds;
    }, [seconds]);

    useEffect(() => {
        if (isSubmitting || submissionResults) return;

        const saveInterval = setInterval(() => {
            if (secondsRef.current > initialTimeSpent) {
                updateReviewTimer(taskId, secondsRef.current);
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [taskId, initialTimeSpent, isSubmitting, submissionResults]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    // Hack: if initialData has '$image' keys etc, use them.
    const taskData = initialData || {};

    const handleChange = (id: string, value: any) => {
        if (isReadOnly) return;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleApprove = async () => {
        setConfirmAction({ isOpen: true, type: 'approve' });
    };

    const handleNextTask = async () => {
        if (submissionResults?.projectId) {
            await startReviewing(submissionResults.projectId);
        } else {
            router.push('/dashboard/review');
        }
    }

    const executeApprove = async () => {
        setConfirmAction({ isOpen: false, type: null });
        setIsSubmitting(true);
        try {
            const result = await approveTask(taskId, formData, rating, seconds, feedback);
            if (result.success && result.data) {
                setSubmissionResults(result.data as any);
                showToast('Task approved successfully', 'success');
            } else {
                showToast(result.error || 'Failed to approve task', 'error');
                setIsSubmitting(false);
            }
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Failed to approve task', 'error');
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        setConfirmAction({ isOpen: true, type: 'reject' });
    };

    const executeReject = async () => {
        setConfirmAction({ isOpen: false, type: null });
        setIsSubmitting(true);
        try {
            const result = await rejectTask(taskId, feedback);
            if (result.success) {
                showToast('Task rejected', 'info');
                router.refresh();
                router.push('/dashboard/review');
            } else {
                showToast(result.error || 'Failed to reject task', 'error');
                setIsSubmitting(false);
            }
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Failed to reject task', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative pb-32">
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

            <div className="pt-6 border-t border-white/5 space-y-4 mt-8 mb-20">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2 font-bold uppercase tracking-widest">Quality Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => !isReadOnly && setRating(star)}
                                disabled={isReadOnly}
                                className={`p-1 transition-all ${rating >= star ? 'text-yellow-500 scale-110' : 'text-white/10 hover:text-white/20'} ${isReadOnly ? 'cursor-default' : ''}`}
                            >
                                <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                    {isReadOnly && (
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <span>Read Only Mode</span>
                        </div>
                    )}
                </div>

                {/* Reviewer Feedback Section */}
                <div className="space-y-3 px-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Feedback for Attempter:</span>
                    </div>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={isReadOnly ? "No feedback provided." : "Write constructive feedback for the attempter... (optional)"}
                        disabled={isReadOnly}
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {!isReadOnly && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleReject}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-red-500/20"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                            Reject & Re-Queue
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                            Approve & Validate
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmAction.isOpen && confirmAction.type === 'approve'}
                onClose={() => setConfirmAction({ isOpen: false, type: null })}
                onConfirm={executeApprove}
                title="Approve Task"
                description="Are you sure you want to approve this task? It will be sent to the client/delivery."
                confirmText="Approve Task"
                type="info"
                isProcessing={isSubmitting}
            />

            <ConfirmDialog
                isOpen={confirmAction.isOpen && confirmAction.type === 'reject'}
                onClose={() => setConfirmAction({ isOpen: false, type: null })}
                onConfirm={executeReject}
                title="Reject Task"
                description="Are you sure you want to REJECT this task? It will be sent back to the queue and current progress cleared."
                confirmText="Reject Task"
                type="danger"
                isProcessing={isSubmitting}
            />
        </div>
    );
}
