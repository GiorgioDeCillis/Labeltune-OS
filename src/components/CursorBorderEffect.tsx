'use client';

import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [borderRadius, setBorderRadius] = useState<string>('0px');
    const [isVisible, setIsVisible] = useState(false);
    const [currentTarget, setCurrentTarget] = useState<HTMLElement | null>(null);
    const trailRef = useRef<HTMLDivElement>(null);

    // Update rect based on current target
    const updateRect = useCallback(() => {
        if (currentTarget) {
            const rect = currentTarget.getBoundingClientRect();
            setTargetRect(rect);
            const style = window.getComputedStyle(currentTarget);
            setBorderRadius(style.borderRadius);
        }
    }, [currentTarget]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Find the nearest meaningful interactive parent or the element itself
        const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card');

        // Check if inside sidebar
        const isInsideSidebar = target.closest('aside') || (target.closest('.Sidebar') !== null);

        if (interactiveTarget && !isInsideSidebar) {
            if (currentTarget !== interactiveTarget) {
                setCurrentTarget(interactiveTarget as HTMLElement);
            }
            setIsVisible(true);
        } else {
            setIsVisible(false);
            setCurrentTarget(null);
        }
    }, [currentTarget]);

    // Track scroll and resize
    useLayoutEffect(() => {
        const main = document.querySelector('main');

        const sync = () => {
            updateRect();
        };

        if (main) {
            main.addEventListener('scroll', sync, { passive: true });
        }
        window.addEventListener('resize', sync);
        window.addEventListener('mousemove', handleMouseMove);

        // Continuous sync when visible to handle animations/shifts
        let rafId: number;
        const tick = () => {
            if (isVisible) {
                updateRect();
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            main?.removeEventListener('scroll', sync);
            window.removeEventListener('resize', sync);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, [handleMouseMove, updateRect, isVisible]);

    if (!targetRect || !isVisible) return null;

    return (
        <div
            ref={trailRef}
            className="fixed pointer-events-none z-[9999] top-0 left-0"
            style={{
                transform: `translate(${targetRect.left - 2}px, ${targetRect.top - 2}px)`,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
                borderRadius: `calc(${borderRadius} + 2px)`,
                // We keep a very fast transition for smoothness during element shifts, but snap on big jumps
                transition: 'transform 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out, border-radius 0.1s ease-out',
            }}
        >
            <div
                className="absolute inset-0 border-2 rounded-[inherit] animate-border-follow"
                style={{
                    borderColor: 'var(--primary)',
                    boxShadow: '0 0 10px var(--primary)',
                    WebkitMaskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 25%, transparent 100%)',
                    maskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 25%, transparent 100%)',
                }}
            />
        </div>
    );
};
