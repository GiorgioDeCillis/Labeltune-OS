'use client';

import React, { useEffect, useRef } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);
    const currentTargetRef = useRef<HTMLElement | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isVisibleRef = useRef(false);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const updatePosition = (rect: DOMRect) => {
        if (!containerRef.current) return;
        containerRef.current.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0)`;
        containerRef.current.style.width = `${rect.width + 4}px`;
        containerRef.current.style.height = `${rect.height + 4}px`;
    };

    const setVisible = (visible: boolean) => {
        if (!containerRef.current) return;
        isVisibleRef.current = visible;
        containerRef.current.style.opacity = visible ? '1' : '0';
        // Use visibility instead of display to avoid layout recalculation
        containerRef.current.style.visibility = visible ? 'visible' : 'hidden';
    };

    const handleTargetChange = (newTarget: HTMLElement | null) => {
        if (currentTargetRef.current === newTarget) return;

        // Cleanup old observer
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
        }

        currentTargetRef.current = newTarget;

        if (newTarget) {
            const rect = newTarget.getBoundingClientRect();
            const style = window.getComputedStyle(newTarget);

            if (containerRef.current) {
                containerRef.current.style.borderRadius = `calc(${style.borderRadius} + 2px)`;
            }

            updatePosition(rect);
            setVisible(true);

            // Observe the target for size/position changes (e.g. animations, layout shifts)
            resizeObserverRef.current = new ResizeObserver(() => {
                if (currentTargetRef.current) {
                    updatePosition(currentTargetRef.current.getBoundingClientRect());
                }
            });
            resizeObserverRef.current.observe(newTarget);
        } else {
            setVisible(false);
        }
    };

    const refreshUnderCursor = (x: number, y: number) => {
        // Temporarily ignore the trail for hit testing
        if (containerRef.current) containerRef.current.style.pointerEvents = 'none';

        const target = document.elementFromPoint(x, y) as HTMLElement;
        if (!target) {
            handleTargetChange(null);
            return;
        }

        const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card') as HTMLElement;
        const isInsideSidebar = target.closest('aside') || target.closest('.Sidebar') !== null;

        if (interactiveTarget && !isInsideSidebar) {
            handleTargetChange(interactiveTarget);
        } else {
            handleTargetChange(null);
        }
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            // Optimization: use the target directly for mousemove to avoid elementFromPoint overhead
            const target = e.target as HTMLElement;
            const interactiveTarget = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card') as HTMLElement;
            const isInsideSidebar = target.closest('aside') || target.closest('.Sidebar') !== null;

            if (interactiveTarget && !isInsideSidebar) {
                handleTargetChange(interactiveTarget);
            } else {
                handleTargetChange(null);
            }
        };

        const onScroll = () => {
            // Re-evaluating under cursor is necessary during scroll
            refreshUnderCursor(lastMousePos.current.x, lastMousePos.current.y);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // RAF for super-smooth positioning during active scroll/interaction
        let rafId: number;
        const tick = () => {
            if (currentTargetRef.current && isVisibleRef.current) {
                updatePosition(currentTargetRef.current.getBoundingClientRect());
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(rafId);
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed pointer-events-none z-[9999] top-0 left-0 opacity-0 invisible"
            style={{
                willChange: 'transform, width, height',
                // Size transition is fine, but we keep transform linear/immediate for jitter-free tracking
                transition: 'width 0.15s ease-out, height 0.15s ease-out, border-radius 0.15s ease-out, opacity 0.2s ease-out',
            }}
        >
            <div
                ref={trailRef}
                className="absolute inset-0 border-2 rounded-[inherit] animate-border-follow"
                style={{
                    borderColor: 'var(--primary)',
                    boxShadow: '0 0 12px var(--primary)',
                    WebkitMaskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 35%, transparent 100%)',
                    maskImage: 'conic-gradient(from var(--trail-angle), black 0%, transparent 35%, transparent 100%)',
                }}
            />
        </div>
    );
};
