'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Columns, Map as MapIcon, Layers } from 'lucide-react';

interface SatelliteCompareProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
}

export function SatelliteCompare({ component, value, readOnly }: SatelliteCompareProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Mock Before/After images (NASA Earth Observatory style)
    const beforeImg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"; // Earth/Night
    const afterImg = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop"; // Earth/Day

    const handleMouseDown = () => {
        if (readOnly) return;
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;

        setSliderPosition(percent);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-black flex flex-col h-[600px]">
            <div className="bg-white/5 border-b border-white/10 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Layers className="text-primary" size={16} />
                    <span className="text-sm font-bold">Change Detection / Damage Assessment</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground flex gap-4">
                    <span className="text-blue-400">Before: 2024-01-01</span>
                    <span className="text-orange-400">After: 2024-01-02</span>
                </div>
            </div>

            <div
                className="flex-1 relative overflow-hidden select-none cursor-ew-resize"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                {/* Background Image (After) */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${afterImg})` }}
                />

                {/* Foreground Image (Before) - Clipped */}
                <div
                    className="absolute inset-0 bg-cover bg-center border-r-2 border-white box-content shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{
                        backgroundImage: `url(${beforeImg})`,
                        width: `${sliderPosition}%`
                    }}
                >
                    <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-blue-300 font-bold border border-blue-500/30">BEFORE</div>
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-10 shadow-[0_0_10px_black]"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl">
                        <Columns size={14} className="text-black rotate-90" />
                    </div>
                </div>

                {/* "AFTER" Label visible on the right side */}
                <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-xs text-orange-300 font-bold border border-orange-500/30">AFTER</div>
            </div>
        </div>
    );
}
