'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const trailRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Find the nearest meaningful interactive parent or the element itself
        const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer');

        // Check if inside sidebar
        const isInsideSidebar = target.closest('aside') || target.closest('[data-sidebar="true"]') || target.closest('.sidebar-container');

        if (interactiveTarget && !isInsideSidebar) {
            const rect = interactiveTarget.getBoundingClientRect();
            setTargetRect(rect);
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    if (!targetRect || !isVisible) return null;

    return (
        <div
            ref={trailRef}
            className="fixed pointer-events-none z-[9999] transition-all duration-300 ease-out"
            style={{
                top: targetRect.top - 2,
                left: targetRect.left - 2,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
                borderRadius: 'inherit',
            }}
        >
            <div className="absolute inset-0 border-2 border-transparent rounded-[inherit] overflow-hidden">
                <div
                    className="absolute inset-[-2px] border-2 rounded-[inherit] animate-border-trail"
                    style={{
                        borderColor: 'var(--primary)',
                        opacity: 0.6,
                        boxShadow: '0 0 15px var(--glow-color, var(--primary))',
                        maskImage: 'linear-gradient(to right, black 20%, transparent 80%)',
                        WebkitMaskImage: 'linear-gradient(to right, black 20%, transparent 80%)',
                    }}
                />
            </div>
        </div>
    );
};
