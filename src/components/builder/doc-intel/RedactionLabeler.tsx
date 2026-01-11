'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Eraser, EyeOff, Type, Image as ImageIcon, MousePointer2 } from 'lucide-react';

interface RedactionLabelerProps {
    component: TaskComponent;
    value?: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
}

interface RedactionRegion {
    id: string;
    type: 'text-span' | 'image-box';
    start?: number; // for text
    end?: number;   // for text
    x?: number;     // for image
    y?: number;     // for image
    width?: number; // for image
    height?: number;// for image
    label?: string; // e.g., "PII", "Secret"
}

export function RedactionLabeler({ component, value, onChange, readOnly }: RedactionLabelerProps) {
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    // Initial value handling
    const redactions: RedactionRegion[] = Array.isArray(value) ? value : [];

    // Mock Content (simulating component data binding)
    const textContent = component.text || "CONFIDENTIAL MEMORANDUM\n\nSubject: Project Chimera\n\nThe asset was acquired on 12/05/2024 at location [REDACTED]. Agent 007 observed suspect behavior near the embassy. The package contains classified blueprints for the quantum reactor. Immediate containment is advised.";
    const imageSrc = component.value || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";

    // Text Selection Handler
    const handleTextSelect = () => {
        if (readOnly || mode !== 'text') return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().length === 0) return;

        const range = selection.getRangeAt(0);
        // Simplified text offset calculation (in real app, robust offset needed)
        // This is a mock implementation for the UI concept
        const id = Math.random().toString(36).substr(2, 9);
        const newRedaction: RedactionRegion = {
            id,
            type: 'text-span',
            start: 0, // Mock
            end: 10,  // Mock
            label: 'Redacted'
        };

        // In a real implementation we would calculate exact char offsets.
        // For UI demo, we append to list.
        onChange([...redactions, newRedaction]);
        selection.removeAllRanges();
    };

    // Image Drawing Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (readOnly || mode !== 'image') return;
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        setIsDrawing(true);
        setStartPoint({ x, y });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDrawing || !startPoint) return;
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / rect.width * 100;
        const currentY = (e.clientY - rect.top) / rect.height * 100;

        const width = Math.abs(currentX - startPoint.x);
        const height = Math.abs(currentY - startPoint.y);
        const x = Math.min(currentX, startPoint.x);
        const y = Math.min(currentY, startPoint.y);

        if (width > 1 && height > 1) { // Min size check
            const newRedaction: RedactionRegion = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'image-box',
                x, y, width, height,
                label: 'Redacted'
            };
            onChange([...redactions, newRedaction]);
        }

        setIsDrawing(false);
        setStartPoint(null);
    };

    return (
        <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-zinc-900 flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="bg-white/5 border-b border-white/10 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex bg-black/40 rounded p-1 gap-1">
                        <button
                            onClick={() => setMode('text')}
                            className={`p-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${mode === 'text' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}`}
                        >
                            <Type size={14} /> Text
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`p-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${mode === 'image' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}`}
                        >
                            <ImageIcon size={14} /> Image
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <EyeOff size={14} />
                    <span>Redaction Mode Active</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto relative bg-zinc-950">
                {mode === 'text' ? (
                    <div
                        className="p-8 font-mono text-sm leading-loose text-zinc-300 max-w-3xl mx-auto selection:bg-black selection:text-white selection:bg-black/90"
                        onMouseUp={handleTextSelect}
                    >
                        {/* Mocking text rendering with highlights strictly for visual demo */}
                        {textContent.split('\n').map((line, i) => (
                            <p key={i} className="mb-4">
                                {line}
                            </p>
                        ))}
                    </div>
                ) : (
                    <div
                        className="relative h-full w-full flex items-center justify-center bg-zinc-900/50"
                        ref={imageRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    // onMouseMove handle would be needed for drag preview
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageSrc}
                            alt="Document to redact"
                            className="max-w-full max-h-full object-contain pointer-events-none select-none"
                        />

                        {/* Render Redaction Boxes */}
                        {redactions.filter(r => r.type === 'image-box').map(r => (
                            <div
                                key={r.id}
                                style={{
                                    position: 'absolute',
                                    left: `${r.x}%`,
                                    top: `${r.y}%`,
                                    width: `${r.width}%`,
                                    height: `${r.height}%`,
                                }}
                                className="bg-black border border-white/20 flex items-center justify-center group cursor-pointer"
                                onClick={() => !readOnly && onChange(redactions.filter(item => item.id !== r.id))}
                            >
                                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest -rotate-45 select-none">
                                    Redacted
                                </div>
                                {!readOnly && <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 text-red-500 bg-black rounded-bl"><Eraser size={12} /></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="bg-white/5 border-t border-white/10 p-2 text-xs text-zinc-500 flex justify-between px-4">
                <span>{redactions.length} items redacted</span>
                <span>{mode === 'text' ? 'Select text to redact' : 'Drag to redact image Area'}</span>
            </div>
        </div>
    );
}
