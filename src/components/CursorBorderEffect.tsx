'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';

export const CursorBorderEffect: React.FC = () => {
    const { trailMode, trailSize } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [targetId, setTargetId] = useState<string>('initial');
    const containerRef = useRef<HTMLDivElement>(null);
    const currentTargetRef = useRef<HTMLElement | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isVisibleRef = useRef(false);

    const prevRect = useRef({ x: 0, y: 0, w: 0, h: 0 });
    const mouseRafRef = useRef<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (trailMode === 'disabled' || !mounted) {
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

            // Explicitly check if target is still in DOM
            if (!target.isConnected) {
                setTarget(null);
                return;
            }

            const rect = target.getBoundingClientRect();

            // Check if element is completely out of viewport
            if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
                updateVisibility(false);
                return;
            } else {
                updateVisibility(true);
            }

            const x = rect.left - 1;
            const y = rect.top - 1;
            const w = rect.width + 2;
            const h = rect.height + 2;

            // Update DOM if position changed
            if (Math.abs(x - prevRect.current.x) < 0.1 &&
                Math.abs(y - prevRect.current.y) < 0.1 &&
                Math.abs(w - prevRect.current.w) < 0.1 &&
                Math.abs(h - prevRect.current.h) < 0.1) {
                return;
            }

            prevRect.current = { x, y, w, h };
            updatePosition(x, y, w, h);
        };

        const setTarget = (newTarget: HTMLElement | null) => {
            if (currentTargetRef.current !== newTarget) {
                currentTargetRef.current = newTarget;
                if (newTarget) {
                    const style = window.getComputedStyle(newTarget);
                    container.style.setProperty('--br', style.borderRadius || '0px');
                    setTargetId(Math.random().toString(36).substr(2, 9));
                    prevRect.current = { x: -9999, y: -9999, w: 0, h: 0 };
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

            if (mouseRafRef.current) return;

            mouseRafRef.current = requestAnimationFrame(() => {
                setTarget(findTarget(e.target as HTMLElement));
                mouseRafRef.current = null;
            });
        };

        const onScroll = () => {
            // Re-detect element under cursor during scroll
            const el = document.elementFromPoint(lastMousePos.current.x, lastMousePos.current.y) as HTMLElement;
            if (el) setTarget(findTarget(el));

            // Force update from current target as it's moving
            updateFromTarget();
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        // Use capture: true to catch scrolls in sub-containers
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
            if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
        };
    }, [trailMode, trailSize, mounted]);

    if (trailMode === 'disabled' || !mounted) return null;

    return createPortal(
        <div
            ref={containerRef}
            className="cursor-trail-container"
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 35, // Use a z-index lower than Navbar (40)
                top: 0,
                left: 0,
                transform: 'translate3d(var(--tx, 0), var(--ty, 0), 0)',
                width: 'var(--tw, 0)',
                height: 'var(--th, 0)',
                borderRadius: 'var(--br, 0)',
                opacity: 'var(--opacity, 0)',
                willChange: 'transform, opacity',
                transition: 'opacity 0.2s ease', // Smooth appearance/disappearance
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
        </div>,
        document.body
    );
};

