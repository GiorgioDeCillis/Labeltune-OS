'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const CursorBorderEffect: React.FC = () => {
    const { trailMode, trailSize } = useTheme();
    const [targetId, setTargetId] = React.useState<string>('initial');
    const containerRef = useRef<HTMLDivElement>(null);
    const currentTargetRef = useRef<HTMLElement | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isVisibleRef = useRef(false);

    useEffect(() => {
        if (trailMode === 'disabled') {
            if (currentTargetRef.current) {
                currentTargetRef.current = null;
                isVisibleRef.current = false;
                if (containerRef.current) {
                    containerRef.current.style.setProperty('--opacity', '0');
                }
            }
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const updatePosition = (x: number, y: number, w: number, h: number) => {
            container.style.setProperty('--tx', `${x}px`);
            container.style.setProperty('--ty', `${y}px`);
            container.style.setProperty('--tw', `${w}px`);
            container.style.setProperty('--th', `${h}px`);
        };

        const updateVisibility = (visible: boolean) => {
            if (isVisibleRef.current === visible) return;
            isVisibleRef.current = visible;
            container.style.setProperty('--opacity', visible ? '1' : '0');
        };

        const updateFromTarget = () => {
            const target = currentTargetRef.current;
            if (!target) return;
            const rect = target.getBoundingClientRect();
            updatePosition(rect.left - 1, rect.top - 1, rect.width + 2, rect.height + 2);
        };

        const setTarget = (newTarget: HTMLElement | null) => {
            if (currentTargetRef.current !== newTarget) {
                currentTargetRef.current = newTarget;
                if (newTarget) {
                    const style = window.getComputedStyle(newTarget);
                    container.style.setProperty('--br', style.borderRadius || '0px');
                    setTargetId(Math.random().toString(36).substr(2, 9));
                    updateFromTarget();
                    updateVisibility(true);
                } else {
                    updateVisibility(false);
                }
            }
        };

        const findTarget = (el: HTMLElement): HTMLElement | null => {
            const selector = trailSize === 'large'
                ? '.glass-panel, .hyprland-window, .card'
                : 'button, a, input, select, textarea, [role="button"], .glass-panel, .hyprland-window, .cursor-pointer, .card';

            const interactive = el.closest(selector) as HTMLElement;
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
            updateFromTarget();
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });

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
    }, [trailMode, trailSize]);

    if (trailMode === 'disabled') return null;

    return (
        <div
            ref={containerRef}
            className="cursor-trail-container"
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 9999,
                top: 0,
                left: 0,
                transform: 'translate3d(var(--tx, 0), var(--ty, 0), 0)',
                width: 'var(--tw, 0)',
                height: 'var(--th, 0)',
                borderRadius: 'var(--br, 0)',
                opacity: 'var(--opacity, 0)',
                willChange: 'transform, opacity',
            }}
        >
            <div
                key={targetId}
                className={trailMode === 'static' ? 'animate-border-follow-once' : 'animate-border-follow'}
                style={{
                    position: 'absolute',
                    inset: 0,
                    border: '2px solid var(--primary)',
                    borderRadius: 'inherit',
                    boxShadow: '0 0 10px var(--primary)',
                    WebkitMaskImage: trailMode === 'static'
                        ? 'conic-gradient(from 0deg, black 0deg, black var(--trail-angle), transparent var(--trail-angle))'
                        : 'conic-gradient(from var(--trail-angle), black 0%, transparent 30%, transparent 100%)',
                    maskImage: trailMode === 'static'
                        ? 'conic-gradient(from 0deg, black 0deg, black var(--trail-angle), transparent var(--trail-angle))'
                        : 'conic-gradient(from var(--trail-angle), black 0%, transparent 30%, transparent 100%)',
                }}
            />
        </div>
    );
};
