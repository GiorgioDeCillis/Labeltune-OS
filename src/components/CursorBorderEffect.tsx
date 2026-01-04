'use client';

import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [borderRadius, setBorderRadius] = useState<string>('0px');
    const [isVisible, setIsVisible] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const currentTargetRef = useRef<HTMLElement | null>(null);

    // Re-check target under cursor
    const refreshTarget = useCallback((clientX: number, clientY: number) => {
        // Temporarily hide trail to get the element underneath it
        const trailBase = document.getElementById('cursor-trail-container');
        if (trailBase) trailBase.style.pointerEvents = 'none';

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

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            refreshTarget(e.clientX, e.clientY);
        };

        const onScroll = () => {
            // Re-target because elements moved under the static cursor
            refreshTarget(lastMousePos.current.x, lastMousePos.current.y);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // High frequency sync loop for position ONLY
        let rafId: number;
        const syncLoop = () => {
            if (currentTargetRef.current && isVisible) {
                const rect = currentTargetRef.current.getBoundingClientRect();
                setTargetRect(rect);
            }
            rafId = requestAnimationFrame(syncLoop);
        };
        rafId = requestAnimationFrame(syncLoop);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(rafId);
        };
    }, [refreshTarget, isVisible]);

    if (!targetRect || !isVisible) return null;

    return (
        <div
            id="cursor-trail-container"
            className="fixed pointer-events-none z-[9999] top-0 left-0 will-change-transform"
            style={{
                transform: `translate3d(${targetRect.left - 2}px, ${targetRect.top - 2}px, 0)`,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
                borderRadius: `calc(${borderRadius} + 2px)`,
                // No transitions for transform to avoid lag during scroll
                transition: 'width 0.15s ease-out, height 0.15s ease-out, border-radius 0.15s ease-out',
            }}
        >
            <div
                className="absolute inset-0 border-2 rounded-[inherit] animate-border-follow"
                style={{
                    borderColor: 'var(--primary)',
                    boxShadow: '0 0 12px var(--primary)',
                    WebkitMaskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 30%, transparent 100%)',
                    maskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 30%, transparent 100%)',
                }}
            />
        </div>
    );
};
