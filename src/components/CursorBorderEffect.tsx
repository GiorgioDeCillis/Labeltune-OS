'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const borderTrailRef = useRef<HTMLDivElement>(null);
    const currentTargetRef = useRef<HTMLElement | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Helper to update DOM directly for performance
    const updateDOM = useCallback((rect: DOMRect, borderRadius: string) => {
        if (!containerRef.current || !borderTrailRef.current) return;

        containerRef.current.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0)`;
        containerRef.current.style.width = `${rect.width + 4}px`;
        containerRef.current.style.height = `${rect.height + 4}px`;
        containerRef.current.style.borderRadius = `calc(${borderRadius} + 2px)`;
    }, []);

    const refreshTarget = useCallback((clientX: number, clientY: number) => {
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
            currentTargetRef.current = interactiveTarget;
            setIsVisible(true);
            // Wait for next frame to ensure ref is ready if it was just turned visible
            requestAnimationFrame(() => updateDOM(rect, style.borderRadius));
        } else {
            setIsVisible(false);
            currentTargetRef.current = null;
        }
    }, [updateDOM]);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            refreshTarget(e.clientX, e.clientY);
        };

        const onScroll = () => {
            refreshTarget(lastMousePos.current.x, lastMousePos.current.y);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // High frequency sync loop using direct DOM manipulation
        let rafId: number;
        const syncLoop = () => {
            if (currentTargetRef.current && isVisible) {
                const rect = currentTargetRef.current.getBoundingClientRect();
                // We don't call updateDOM here for EVERY frame unless needed, 
                // but for scrolling it helps stay perfectly synced.
                if (containerRef.current) {
                    containerRef.current.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0)`;
                    containerRef.current.style.width = `${rect.width + 4}px`;
                    containerRef.current.style.height = `${rect.height + 4}px`;
                }
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

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed pointer-events-none z-[9999] top-0 left-0 will-change-transform"
            style={{
                // No initial styles that React needs to track, we use the ref
                transition: 'width 0.15s ease-out, height 0.15s ease-out, border-radius 0.15s ease-out',
            }}
        >
            <div
                ref={borderTrailRef}
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
