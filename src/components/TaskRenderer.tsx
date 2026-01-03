'use client';

import React, { useState } from 'react';
import { FormComponent } from '@/components/builder/TaskBuilder';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function TaskRenderer({
    schema,
    taskId,
    initialData,
    isReadOnly = false
}: {
    schema: FormComponent[],
    taskId: string,
    initialData?: any,
    isReadOnly?: boolean
}) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (id: string, value: any) => {
        if (isReadOnly) return;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Update task with labels and mark as completed (or pending review)
        const { error } = await supabase
            .from('tasks')
            .update({
                labels: formData,
                status: 'completed' // Simple flow for now
            })
            .eq('id', taskId);

        setIsSubmitting(false);

        if (error) {
            console.error('Error submitting task:', error);
            alert('Failed to submit task. Please try again.');
        } else {
            router.push('/dashboard/tasks');
            router.refresh(); // Refresh to update lists
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

                        {renderInput(component, formData[component.id], (val) => handleChange(component.id, val), isReadOnly)}
                    </div>
                ))}
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

function renderInput(
    component: FormComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly: boolean
) {
    if (component.type === 'text_input') {
        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                placeholder={component.placeholder}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
            />
        );
    }

    if (component.type === 'textarea') {
        return (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                rows={4}
                placeholder={component.placeholder}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none disabled:opacity-50"
            />
        );
    }

    if (component.type === 'single_select') {
        return (
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
            >
                <option value="">Select an option</option>
                {component.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        )
    }

    if (component.type === 'multi_select') {
        // Simple implementation for multi-select
        const selected = Array.isArray(value) ? value : [];
        const toggleOption = (opt: string) => {
            if (selected.includes(opt)) {
                onChange(selected.filter((s: string) => s !== opt));
            } else {
                onChange([...selected, opt]);
            }
        };

        return (
            <div className="space-y-2">
                {component.options?.map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selected.includes(opt)
                            ? 'bg-primary/10 border-primary/50'
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        } ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={() => toggleOption(opt)}
                            className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{opt}</span>
                    </label>
                ))}
            </div>
        )
    }

    if (component.type === 'rating') {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => onChange(num)}
                        disabled={readOnly}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${value === num
                                ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-110'
                                : 'bg-white/10 hover:bg-white/20 text-muted-foreground'
                            } ${readOnly ? 'pointer-events-none' : ''}`}
                    >
                        {num}
                    </button>
                ))}
            </div>
        )
    }

    if (component.type === 'markdown_display') {
        return (
            <div className="prose prose-invert prose-sm bg-white/5 p-4 rounded-lg border border-white/5">
                {/* Normally render Markdown properly here */}
                {component.description || 'No content'}
            </div>
        )
    }

    return <div className="text-red-400 text-xs">Unsupported component type: {component.type}</div>;
}
