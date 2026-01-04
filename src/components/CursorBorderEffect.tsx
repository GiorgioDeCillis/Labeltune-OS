'use client';

import React, { useEffect, useRef } from 'react';

export const CursorBorderEffect: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentTargetRef = useRef<HTMLElement | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isVisibleRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateVisibility = (visible: boolean) => {
            if (isVisibleRef.current === visible) return;
            isVisibleRef.current = visible;
            container.style.opacity = visible ? '1' : '0';
        };

        const updateFromTarget = () => {
            const target = currentTargetRef.current;
            if (!target) return;

            const rect = target.getBoundingClientRect();
            container.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0)`;
            container.style.width = `${rect.width + 4}px`;
            container.style.height = `${rect.height + 4}px`;
        };

        const setTarget = (newTarget: HTMLElement | null) => {
            if (currentTargetRef.current !== newTarget) {
                currentTargetRef.current = newTarget;
                if (newTarget) {
                    const style = window.getComputedStyle(newTarget);
                    container.style.borderRadius = style.borderRadius || '0px';
                    updateFromTarget();
                    updateVisibility(true);
                } else {
                    updateVisibility(false);
                }
            }
        };

        const findTarget = (el: HTMLElement): HTMLElement | null => {
            const interactive = el.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card') as HTMLElement;
            const inSidebar = el.closest('aside') || el.closest('.Sidebar');
            return interactive && !inSidebar ? interactive : null;
        };

        const onMouseMove = (e: MouseEvent) => {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setTarget(findTarget(e.target as HTMLElement));
        };

        const onScroll = () => {
            const el = document.elementFromPoint(lastMousePos.current.x, lastMousePos.current.y) as HTMLElement;
            if (el) setTarget(findTarget(el));
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });

        // Single RAF loop for smooth tracking
        let rafId: number;
        const loop = () => {
            if (isVisibleRef.current && currentTargetRef.current) {
                updateFromTarget();
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll, true);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed pointer-events-none z-[9999] top-0 left-0 opacity-0"
            style={{ willChange: 'transform' }}
        >
            <div
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
