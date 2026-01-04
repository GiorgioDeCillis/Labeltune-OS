'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [borderRadius, setBorderRadius] = useState<string>('0px');
    const [isVisible, setIsVisible] = useState(false);
    const trailRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Find the nearest meaningful interactive parent or the element itself
        const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card');

        // Check if inside sidebar
        const isInsideSidebar = target.closest('aside') || target.closest('.Sidebar') !== null;

        if (interactiveTarget && !isInsideSidebar) {
            const rect = interactiveTarget.getBoundingClientRect();
            const style = window.getComputedStyle(interactiveTarget);
            setBorderRadius(style.borderRadius);
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
            className="fixed pointer-events-none z-[9999]"
            style={{
                top: targetRect.top - 2,
                left: targetRect.left - 2,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
                borderRadius: `calc(${borderRadius} + 2px)`,
                transition: 'top 0.15s ease-out, left 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out',
            }}
        >
            <div
                className="absolute inset-0 border-2 rounded-[inherit] animate-border-follow"
                style={{
                    borderColor: 'var(--primary)',
                    boxShadow: '0 0 10px var(--primary)',
                    WebkitMaskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 20%, transparent 100%)',
                    maskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 20%, transparent 100%)',
                }}
            />
        </div>
    );
};
