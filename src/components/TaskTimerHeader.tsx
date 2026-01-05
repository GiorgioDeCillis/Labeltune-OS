'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TaskTimerHeaderProps {
    initialTimeSpent: number;
    maxTime: number | null;
    isReadOnly?: boolean;
}

export function TaskTimerHeader({ initialTimeSpent, maxTime, isReadOnly = false }: TaskTimerHeaderProps) {
    const [seconds, setSeconds] = useState(initialTimeSpent);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
    };

    return (
        <div className="flex items-center gap-2 text-muted-foreground bg-white/5 px-3 py-1 rounded-md border border-white/5">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono font-medium">
                {formatTime(seconds)}
                {maxTime && <span className="opacity-50"> / {formatTime(maxTime)}</span>}
            </span>
        </div>
    );
}
