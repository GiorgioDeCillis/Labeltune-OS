'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Link2, Split, Trash2, ArrowRight } from 'lucide-react';

interface ClauseLinkerProps {
    component: TaskComponent;
    value?: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
}

interface Link {
    id: string;
    sourceText: string;
    targetText: string;
    color: string;
}

export function ClauseLinker({ component, value, onChange, readOnly }: ClauseLinkerProps) {
    const [links, setLinks] = useState<Link[]>(Array.isArray(value) ? value : []);
    const [selectedSpan, setSelectedSpan] = useState<{ text: string, side: 'left' | 'right' } | null>(null);

    // Mock Text
    const leftText = "SECTION 1.1 - DEFINITIONS\n\n\"Affiliate\" means any entity that directly or indirectly controls, is controlled by, or is under common control with the subject entity.\n\n\"Confidential Information\" means all information disclosed by a party to the other party, whether orally or in writing, that is designated as confidential.";
    const rightText = "AGREEMENT TERMS\n\n5.2 Limitations. Each party will protect the other's Confidential Information data in the same manner as it protects its own.\n\nThe restrictions will not apply if the Affiliate has given written consent prior to disclosure.";

    // Simple colors for links
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const handleSelect = (text: string, side: 'left' | 'right') => {
        if (readOnly) return;

        if (selectedSpan && selectedSpan.side !== side) {
            // Create Link
            const newLink: Link = {
                id: Math.random().toString(36).substr(2, 9),
                sourceText: selectedSpan.side === 'left' ? selectedSpan.text : text,
                targetText: selectedSpan.side === 'left' ? text : selectedSpan.text,
                color: colors[links.length % colors.length]
            };
            const newLinks = [...links, newLink];
            setLinks(newLinks);
            onChange(newLinks);
            setSelectedSpan(null);
        } else {
            setSelectedSpan({ text, side });
        }
    };

    const removeLink = (id: string) => {
        if (readOnly) return;
        const newLinks = links.filter(l => l.id !== id);
        setLinks(newLinks);
        onChange(newLinks);
    };

    return (
        <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-zinc-950 flex flex-col h-[600px]">
            <div className="bg-white/5 border-b border-white/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Split size={16} className="text-primary" />
                    <span className="font-bold text-sm">Clause & Citation Linker</span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {selectedSpan
                        ? <span className="text-primary animate-pulse">Select target text to link...</span>
                        : "Select text on one side, then the other to link."}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Visual Lines Overlay (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-50">
                    {links.map((link, i) => (
                        // Mock lines - in reality would need precise coordinates from refs
                        <path
                            key={link.id}
                            d={`M 30% ${20 + i * 15}% C 40% ${20 + i * 15}%, 60% ${40 + i * 15}%, 70% ${40 + i * 15}%`}
                            fill="none"
                            stroke={link.color}
                            strokeWidth="2"
                            strokeDasharray="4"
                        />
                    ))}
                </svg>

                {/* Left Pane */}
                <div className="flex-1 border-r border-white/10 p-6 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Source Document (Definitions)</div>
                    <div className="text-sm font-serif leading-loose text-zinc-300 whitespace-pre-wrap">
                        {leftText.split('\n').map((line, i) => (
                            <p key={i} className="mb-4">
                                {line.split(' ').map((word, wI) => {
                                    // Identify linked words (very simple check)
                                    const linked = links.find(l => l.sourceText.includes(word.replace(/[^a-zA-Z]/g, '')) || word.includes(l.sourceText));
                                    const isSelected = selectedSpan?.side === 'left' && selectedSpan.text === word;

                                    return (
                                        <span
                                            key={wI}
                                            onClick={() => handleSelect(word.replace(/[^a-zA-Z]/g, ''), 'left')}
                                            className={`cursor-pointer transition-all px-0.5 rounded ${linked ? 'font-bold' : 'hover:bg-white/10'
                                                } ${isSelected ? 'bg-primary/30 ring-1 ring-primary' : ''}`}
                                            style={{ color: linked ? linked.color : undefined }}
                                        >
                                            {word}{' '}
                                        </span>
                                    );
                                })}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Right Pane */}
                <div className="flex-1 p-6 overflow-y-auto bg-zinc-900/50">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Target Document (Clauses)</div>
                    <div className="text-sm font-serif leading-loose text-zinc-300 whitespace-pre-wrap">
                        {rightText.split('\n').map((line, i) => (
                            <p key={i} className="mb-4">
                                {line.split(' ').map((word, wI) => {
                                    const linked = links.find(l => l.targetText.includes(word.replace(/[^a-zA-Z]/g, '')) || word.includes(l.targetText));
                                    const isSelected = selectedSpan?.side === 'right' && selectedSpan.text === word;

                                    return (
                                        <span
                                            key={wI}
                                            onClick={() => handleSelect(word.replace(/[^a-zA-Z]/g, ''), 'right')}
                                            className={`cursor-pointer transition-all px-0.5 rounded ${linked ? 'font-bold' : 'hover:bg-white/10'
                                                } ${isSelected ? 'bg-primary/30 ring-1 ring-primary' : ''}`}
                                            style={{ color: linked ? linked.color : undefined }}
                                        >
                                            {word}{' '}
                                        </span>
                                    );
                                })}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Links List Footer */}
            <div className="h-32 bg-zinc-900 border-t border-white/10 p-3 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Active Links</div>
                <div className="flex flex-wrap gap-2">
                    {links.length === 0 && <span className="text-xs text-muted-foreground italic">No links created yet.</span>}
                    {links.map(link => (
                        <div key={link.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">
                            <Link2 size={10} style={{ color: link.color }} />
                            <span className="font-mono text-zinc-400">{link.sourceText}</span>
                            <ArrowRight size={10} className="text-muted-foreground" />
                            <span className="font-mono text-white">{link.targetText}</span>
                            <button onClick={() => removeLink(link.id)} className="ml-2 text-zinc-600 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
