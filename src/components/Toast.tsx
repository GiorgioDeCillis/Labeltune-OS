'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => dismissToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        info: <Info className="w-5 h-5 text-primary" />,
    };

    const borderColors = {
        success: 'border-green-500/30',
        error: 'border-red-500/30',
        warning: 'border-yellow-500/30',
        info: 'border-primary/30',
    };

    return (
        <div
            className={`
                pointer-events-auto 
                glass-panel 
                border ${borderColors[toast.type]}
                px-4 py-3 
                rounded-xl 
                shadow-2xl 
                flex items-center gap-3 
                min-w-[300px] max-w-[400px]
                animate-in slide-in-from-right-5 fade-in duration-300
            `}
        >
            {icons[toast.type]}
            <span className="flex-1 text-sm font-medium text-white/90">{toast.message}</span>
            <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
