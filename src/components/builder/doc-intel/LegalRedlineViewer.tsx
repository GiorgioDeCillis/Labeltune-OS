'use client';

import React, { useState } from 'react';
import { TaskComponent } from '../types';
import { GitCompare, Check, X, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LegalRedlineViewerProps {
    component: TaskComponent;
    value?: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
}

interface DiffChange {
    id: string;
    type: 'added' | 'removed' | 'modified';
    status: 'pending' | 'accepted' | 'rejected';
    originalText?: string;
    newText?: string;
    lineNumber: number;
}

export function LegalRedlineViewer({ component, value, onChange, readOnly }: LegalRedlineViewerProps) {
    // Mock Data simulating a diff result
    const initialChanges: DiffChange[] = value || [
        { id: '1', type: 'removed', status: 'pending', originalText: 'The Supplier shall be liable for all damages.', lineNumber: 12 },
        { id: '2', type: 'added', status: 'pending', newText: 'The Supplier shall be liable for direct damages only, capped at $1M.', lineNumber: 12 },
        { id: '3', type: 'modified', status: 'pending', originalText: 'Net 30', newText: 'Net 60', lineNumber: 45 }
    ];

    // Assuming we manage state of decisions made on diffs
    const [changes, setChanges] = useState<DiffChange[]>(initialChanges);
    const [activeChangeId, setActiveChangeId] = useState<string | null>(null);

    const handleDecision = (id: string, decision: 'accepted' | 'rejected') => {
        if (readOnly) return;
        const updated = changes.map(c => c.id === id ? { ...c, status: decision } : c);
        setChanges(updated);
        onChange(updated);
    };

    return (
        <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-zinc-950 flex flex-col h-[700px]">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <GitCompare size={16} className="text-primary" />
                        Contract Comparison
                    </h3>
                    <p className="text-xs text-muted-foreground">Review changes between Version 1.2 and Version 1.3</p>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-green-400">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> +{changes.filter(c => c.type === 'added').length} Added
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                        <div className="w-2 h-2 rounded-full bg-red-500" /> -{changes.filter(c => c.type === 'removed').length} Removed
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Simulated Document View with inline Highlight */}
                <div className="flex-1 border-r border-white/10 overflow-y-auto p-8 font-serif text-sm leading-relaxed text-zinc-300 bg-zinc-900/50">
                    <p className="mb-4 text-zinc-500 font-mono text-xs uppercase">Document View (With Redlines)</p>

                    <p className="mb-4">
                        Thinking about the nature of the agreement...
                    </p>

                    <div className="my-6 pl-4 border-l-2 border-yellow-500/30">
                        {/* Render mock diff block */}
                        <div className="bg-red-900/20 p-1 text-red-300 line-through decoration-red-500/50 text-xs mb-1">
                            The Supplier shall be liable for all damages.
                        </div>
                        <div className="bg-green-900/20 p-1 text-green-300 border border-green-500/20 rounded">
                            The Supplier shall be liable for direct damages only, capped at $1M.
                        </div>
                    </div>

                    <p className="mb-4">
                        Further provisions regarding payment terms. Payment shall be due <span className="bg-yellow-500/20 text-yellow-200 px-1 border border-yellow-500/30 rounded mx-1">Net 60</span> days from invoice.
                    </p>

                    <p className="opacity-50 blur-[1px]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>

                {/* Change List / Decision Panel */}
                <div className="w-[350px] bg-zinc-900 overflow-y-auto border-l border-white/5">
                    <div className="p-4 border-b border-white/10 bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detected Changes ({changes.length})</span>
                    </div>

                    <div className="p-2 space-y-2">
                        {changes.map((change) => (
                            <div
                                key={change.id}
                                className={`p-3 rounded-lg border transition-all ${change.status === 'pending'
                                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                                        : change.status === 'accepted'
                                            ? 'bg-green-900/10 border-green-500/30'
                                            : 'bg-red-900/10 border-red-500/30'
                                    }`}
                                onClick={() => setActiveChangeId(change.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${change.type === 'added' ? 'bg-green-500/20 text-green-400' :
                                            change.type === 'removed' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {change.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">L{change.lineNumber}</span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {change.originalText && (
                                        <div className="text-xs text-red-400/80 bg-red-950/30 p-1.5 rounded line-through decoration-red-500/30 break-all">
                                            {change.originalText}
                                        </div>
                                    )}
                                    {change.newText && (
                                        <div className="text-xs text-green-400/80 bg-green-950/30 p-1.5 rounded break-all">
                                            {change.newText}
                                        </div>
                                    )}
                                </div>

                                {!readOnly && change.status === 'pending' && (
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDecision(change.id, 'accepted'); }}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-medium transition-colors"
                                        >
                                            <Check size={12} /> Accept
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDecision(change.id, 'rejected'); }}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium transition-colors"
                                        >
                                            <X size={12} /> Reject
                                        </button>
                                    </div>
                                )}

                                {change.status !== 'pending' && (
                                    <div className={`text-xs font-bold flex items-center gap-1 mt-2 ${change.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                        {change.status === 'accepted' ? <Check size={12} /> : <X size={12} />}
                                        {change.status.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
