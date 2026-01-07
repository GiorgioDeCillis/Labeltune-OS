'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye } from 'lucide-react';
import { TaskRenderer } from '@/components/TaskRenderer';
import { TaskComponent } from './types';

interface TaskPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    schema: TaskComponent[];
    project?: any;
}

export function TaskPreviewModal({
    isOpen,
    onClose,
    schema,
    project
}: TaskPreviewModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-12">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                className="relative w-full h-full max-w-6xl glass-panel border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Task Preview</h3>
                            <p className="text-sm text-muted-foreground">
                                This is how the task will appear to the attempter.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-muted-foreground hover:text-white group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <TaskRenderer
                            schema={schema}
                            taskId="preview-task-id"
                            projectId={project?.id || 'preview-project-id'}
                            isReadOnly={false} // Allow interaction in preview
                            taskStatus="pending"
                        />
                    </div>
                </div>

                {/* Footer / Notice */}
                <div className="p-4 bg-primary/5 border-t border-primary/10 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
                        Interactive Preview Mode &bull; No data will be saved
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
