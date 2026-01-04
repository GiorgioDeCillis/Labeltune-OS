'use client';

import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [borderRadius, setBorderRadius] = useState<string>('0px');
    const [isVisible, setIsVisible] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const currentTargetRef = useRef<HTMLElement | null>(null);

    const updateTarget = useCallback((clientX: number, clientY: number) => {
        const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
        if (!target) {
            setIsVisible(false);
            currentTargetRef.current = null;
            return;
        }

        const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card') as HTMLElement;
        const isInsideSidebar = target.closest('aside') || target.closest('.Sidebar') !== null;

        if (interactiveTarget && !isInsideSidebar) {
            const rect = interactiveTarget.getBoundingClientRect();
            const style = window.getComputedStyle(interactiveTarget);
            setBorderRadius(style.borderRadius);
            setTargetRect(rect);
            setIsVisible(true);
            currentTargetRef.current = interactiveTarget;
        } else {
            setIsVisible(false);
            currentTargetRef.current = null;
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        updateTarget(e.clientX, e.clientY);
    }, [updateTarget]);

    const handleScroll = useCallback(() => {
        // When scrolling, re-check what's under the last known mouse position
        updateTarget(lastMousePos.current.x, lastMousePos.current.y);
    }, [updateTarget]);

    useLayoutEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        // Use capturing phase for scroll to ensure we catch it from any scrollable container
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        // Continuous sync to handle any other layout shifts or animations
        let rafId: number;
        const tick = () => {
            if (currentTargetRef.current && isVisible) {
                const rect = currentTargetRef.current.getBoundingClientRect();
                setTargetRect(rect);
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, [handleMouseMove, handleScroll, isVisible]);

    if (!targetRect || !isVisible) return null;

    return (
        <div
            className="fixed pointer-events-none z-[9999] top-0 left-0"
            style={{
                transform: `translate(${targetRect.left - 2}px, ${targetRect.top - 2}px)`,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
                borderRadius: `calc(${borderRadius} + 2px)`,
                transition: 'transform 0.05s linear, width 0.1s ease-out, height 0.1s ease-out, border-radius 0.1s ease-out',
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
