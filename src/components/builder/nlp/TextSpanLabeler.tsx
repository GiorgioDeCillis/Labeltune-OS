'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Type } from 'lucide-react';

interface TextSpan {
    id: string;
    start: number;
    end: number;
    text: string;
    label: string;
    color: string;
    relations?: { toId: string; label: string; color: string }[];
}

interface TextSpanLabelerProps {
    text: string;
    component: TaskComponent;
    value: TextSpan[];
    onChange: (spans: TextSpan[]) => void;
    readOnly?: boolean;
}

export function TextSpanLabeler({ text, component, value = [], onChange, readOnly }: TextSpanLabelerProps) {
    const [activeLabel, setActiveLabel] = useState<string>(component.labels?.[0]?.value || 'Entity');
    const [mode, setMode] = useState<'ner' | 'relation'>('ner');
    const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update active label when component changes
    useEffect(() => {
        if (component.labels?.length && !component.labels.find(l => l.value === activeLabel)) {
            setActiveLabel(component.labels[0].value);
        }
    }, [component.labels]);

    const handleMouseUp = () => {
        if (readOnly || mode === 'relation') return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const container = containerRef.current;

        // Verify selection is within our container
        if (!container || !container.contains(range.commonAncestorContainer)) return;

        // Calculate offsets relative to the text content
        // This is tricky with HTML/Rich text, but assuming plain text rendered in a div for now.
        // We will traverse nodes to find the offset.

        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(container);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selection.toString().length;
        const selectedText = selection.toString();

        if (selectedText.trim().length === 0) return;

        // Check for overlaps (simplified: just simple overlaps)
        const hasOverlap = value.some(span =>
            (start >= span.start && start < span.end) ||
            (end > span.start && end <= span.end) ||
            (start <= span.start && end >= span.end)
        );

        if (hasOverlap) {
            // Provide feedback or just ignore
            // For MVP ignoring
            selection.removeAllRanges();
            return;
        }

        const labelConfig = component.labels?.find(l => l.value === activeLabel);

        const newSpan: TextSpan = {
            id: uuidv4(),
            start,
            end,
            text: selectedText,
            label: activeLabel,
            color: labelConfig?.background || '#333'
        };

        onChange([...value, newSpan]);
        selection.removeAllRanges();
    };

    const removeSpan = (id: string) => {
        if (readOnly) return;
        onChange(value.filter(s => s.id !== id).map(s => ({
            ...s,
            relations: s.relations?.filter(r => r.toId !== id)
        })));
    };

    const handleSpanClick = (id: string) => {
        if (readOnly || mode !== 'relation') return;

        if (!linkingFrom) {
            setLinkingFrom(id);
        } else {
            if (linkingFrom !== id) {
                const labelConfig = component.labels?.find(l => l.value === activeLabel);
                const newValue = value.map(span => {
                    if (span.id === linkingFrom) {
                        const relations = span.relations || [];
                        return {
                            ...span,
                            relations: [...relations, { toId: id, label: activeLabel, color: labelConfig?.background || '#fff' }]
                        };
                    }
                    return span;
                });
                onChange(newValue);
            }
            setLinkingFrom(null);
        }
    };

    // Rendering the text with highlighted spans
    // We sort spans by start index
    const sortedSpans = [...value].sort((a, b) => a.start - b.start);

    const renderContent = () => {
        const parts = [];
        let lastIndex = 0;

        sortedSpans.forEach(span => {
            // Text before span
            if (span.start > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>{text.substring(lastIndex, span.start)}</span>
                );
            }

            // The span itself
            parts.push(
                <span
                    key={span.id}
                    onClick={() => handleSpanClick(span.id)}
                    className={`relative group cursor-pointer inline-block mx-0.5 rounded px-1 py-0.5 transition-all hover:opacity-80 ${linkingFrom === span.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                    style={{ backgroundColor: span.color + '40', border: `1px solid ${span.color}` }}
                >
                    {text.substring(span.start, span.end)}
                    <span
                        className="absolute -top-5 left-0 text-[9px] font-bold uppercase tracking-wider px-1 rounded text-white whitespace-nowrap pointer-events-none"
                        style={{ backgroundColor: span.color }}
                    >
                        {span.label}
                    </span>
                    {!readOnly && (
                        <button
                            onClick={(e) => { e.stopPropagation(); removeSpan(span.id); }}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-2 h-2" />
                        </button>
                    )}
                </span>
            );

            lastIndex = span.end;
        });

        // Remaining text
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
            );
        }

        return parts;
    };

    return (
        <div className="flex flex-col gap-4 border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white/5 border-b border-white/10 p-3 flex items-center gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">NER Entity:</span>
                    <div className="flex flex-wrap gap-2">
                        {component.labels?.map(l => (
                            <button
                                key={l.value}
                                onClick={() => setActiveLabel(l.value)}
                                className={`px-2 py-1 rounded text-xs font-bold transition-all border flex items-center gap-2 ${activeLabel === l.value
                                    ? 'ring-1 ring-white'
                                    : 'opacity-60 hover:opacity-100 border-transparent bg-white/5'
                                    }`}
                                style={{
                                    backgroundColor: activeLabel === l.value ? l.background : undefined,
                                    borderColor: l.background
                                }}
                            >
                                {l.value}
                                {activeLabel === l.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-white/10" />

                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => { setMode('ner'); setLinkingFrom(null); }}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mode === 'ner' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        NER
                    </button>
                    <button
                        onClick={() => setMode('relation')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mode === 'relation' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                        RELATION
                    </button>
                </div>
            </div>

            {/* Text Area */}
            {/* Relations display (simplified list below text) */}
            {value.some(s => s.relations?.length) && (
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                    {value.map(span => (
                        span.relations?.map((rel, idx) => {
                            const target = value.find(s => s.id === rel.toId);
                            if (!target) return null;
                            return (
                                <div key={`${span.id}-${rel.toId}-${idx}`} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-mono">
                                    <span style={{ color: span.color }}>{span.text}</span>
                                    <span className="text-muted-foreground">--[{rel.label}]--&gt;</span>
                                    <span style={{ color: target.color }}>{target.text}</span>
                                </div>
                            );
                        })
                    ))}
                </div>
            )}
            <div
                ref={containerRef}
                onMouseUp={handleMouseUp}
                className={`p-6 text-lg leading-loose font-mono whitespace-pre-wrap min-h-[200px] ${mode === 'relation' ? 'cursor-alias' : 'cursor-text'}`}
            >
                {sortedSpans.length > 0 ? renderContent() : text}
            </div>

            {/* Info Footer */}
            <div className="bg-white/5 border-t border-white/10 p-2 px-4 flex justify-between items-center text-xs text-muted-foreground">
                <span>{value.length} entities identified</span>
                <span>Select text to label</span>
            </div>
        </div>
    );
}
