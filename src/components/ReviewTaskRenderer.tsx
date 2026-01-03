'use client';

import React, { useState } from 'react';
import { FormComponent } from '@/components/builder/TaskBuilder';
import { useRouter } from 'next/navigation';
import { Loader2, ThumbsUp, ThumbsDown, Save } from 'lucide-react';
import { approveTask, rejectTask } from '@/app/dashboard/review/actions';

export function ReviewTaskRenderer({
    schema,
    taskId,
    initialData
}: {
    schema: FormComponent[],
    taskId: string,
    initialData?: any
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleChange = (id: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this task? It will be sent to the client/delivery.')) return;

        setIsSubmitting(true);
        try {
            await approveTask(taskId, formData);
            // Router redirect handled in server action, but in client component we might need to wait or handle manually if server action redirect doesn't trigger full page reload effectively in some next.js versions, but usually it does.
        } catch (e) {
            console.error(e);
            alert('Failed to approve task');
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to REJECT this task? It will be sent back to the queue and current progress cleared.')) return;

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
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {schema.map((component) => (
                    <div key={component.id} className="space-y-2">
                        {component.type !== 'markdown_display' && (
                            <label className="text-sm font-bold block">
                                {component.label} {component.required && <span className="text-red-400">*</span>}
                            </label>
                        )}

                        <div className="text-xs text-muted-foreground mb-1">{component.description}</div>

                        {renderInput(component, formData[component.id], (val) => handleChange(component.id, val))}
                    </div>
                ))}
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
        </div>
    );
}

// Duplicated helper for now to avoid circular deps or weird imports, can be shared in utils later
function renderInput(
    component: FormComponent,
    value: any,
    onChange: (val: any) => void
) {
    if (component.type === 'text_input') {
        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={component.placeholder}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
        );
    }
    // ... Simplified renderer for other types
    if (component.type === 'textarea') {
        return (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                placeholder={component.placeholder}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
        );
    }
    if (component.type === 'single_select') {
        return (
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            >
                <option value="">Select an option</option>
                {component.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        )
    }
    // Minimal fallback for others
    return (
        <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-sm text-muted-foreground">
            {component.type} - Value: {JSON.stringify(value)}
            {/* Full implementation would copy TaskRenderer logic */}
        </div>
    );
}
