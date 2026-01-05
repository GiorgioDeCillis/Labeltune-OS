'use client';

import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'question';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    isProcessing?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    isProcessing = false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const icons = {
        danger: <AlertCircle className="w-6 h-6 text-red-500" />,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
        info: <Info className="w-6 h-6 text-primary" />,
        question: <HelpCircle className="w-6 h-6 text-primary" />
    };

    const confirmButtonStyles = {
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20',
        info: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20',
        question: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
    };

    const iconBgStyles = {
        danger: 'bg-red-500/10 border-red-500/20',
        warning: 'bg-yellow-500/10 border-yellow-500/20',
        info: 'bg-primary/10 border-primary/20',
        question: 'bg-primary/10 border-primary/20'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl border ${iconBgStyles[type]}`}>
                            {icons[type]}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${confirmButtonStyles[type]}`}
                        >
                            {isProcessing && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
