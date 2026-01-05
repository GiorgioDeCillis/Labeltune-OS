'use client';

import React, { useState } from 'react';
import { TaskComponent } from '@/components/builder/types';
import { useRouter } from 'next/navigation';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { approveTask, rejectTask } from '@/app/dashboard/review/actions';
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

export function ReviewTaskRenderer({
    schema,
    taskId,
    initialData
}: {
    schema: TaskComponent[],
    taskId: string,
    initialData?: any
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
    }>({ isOpen: false, type: null });

    // Hack: if initialData has '$image' keys etc, use them.
    const taskData = initialData || {};

    const handleChange = (id: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleApprove = async () => {
        setConfirmAction({ isOpen: true, type: 'approve' });
    };

    const executeApprove = async () => {
        setConfirmAction({ isOpen: false, type: null });
        setIsSubmitting(true);
        try {
            await approveTask(taskId, formData);
        } catch (e) {
            console.error(e);
            alert('Failed to approve task'); // Keeping alert for errors for now as it's not a confirm
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
            await rejectTask(taskId);
        } catch (e) {
            console.error(e);
            alert('Failed to reject task');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
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
                    const onChange = (val: any) => handleChange(component.name || component.id, val);

                    if (component.type === 'Choices') return <ChoicesControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'Rating') return <RatingControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'TextArea') return <TextAreaControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'Labels' || component.type === 'RectangleLabels') return <ImageLabelsControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'RubricScorer') return <RubricScorerControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'Ranking') return <RankingControl key={component.id} component={component} value={value} onChange={onChange} />;
                    if (component.type === 'Feedback') return <FeedbackControl key={component.id} component={component} value={value} onChange={onChange} />;

                    return <div key={component.id} className="text-red-400 text-xs">Unsupported component: {component.type}</div>;
                })}
            </div>

            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 mt-4">
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
