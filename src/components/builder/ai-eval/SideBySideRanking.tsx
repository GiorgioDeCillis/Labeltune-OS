'use client';

import React, { useState } from 'react';
import { TaskComponent } from '../types';
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from 'lucide-react';

interface SideBySideRankingProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
}

export function SideBySideRanking({ component, value, readOnly }: SideBySideRankingProps) {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const modelA = "The capital of France is Paris. It is known for its cafe culture and landmarks like the Eiffel Tower.";
    const modelB = "Paris is France's capital. Famous for the Eiffel Tower and art museums like the Louvre.";

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col h-[500px]">
            <div className="bg-white/5 p-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white mb-1">Human Preference Ranking (RLHF)</h3>
                <p className="text-xs text-muted-foreground">Please select the better response for the given prompt.</p>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Prompt Column */}
                <div className="w-1/3 bg-slate-900/50 p-4 border-r border-white/10 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-widest">User Prompt</div>
                    <div className="text-sm text-slate-200">"What is the capital of France and what is it famous for?"</div>
                </div>

                {/* Model A */}
                <div className={`flex-1 p-4 border-r border-white/10 flex flex-col ${selectedModel === 'A' ? 'bg-blue-500/10' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase font-bold text-purple-400 tracking-widest">Model A</div>
                    </div>
                    <div className="flex-1 text-sm text-slate-300 font-serif leading-relaxed p-2 bg-black/20 rounded border border-white/5">
                        {modelA}
                    </div>
                    {!readOnly && (
                        <button
                            onClick={() => setSelectedModel('A')}
                            className={`mt-4 py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors ${selectedModel === 'A' ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Choose Model A</span>
                        </button>
                    )}
                </div>

                {/* Model B */}
                <div className={`flex-1 p-4 flex flex-col ${selectedModel === 'B' ? 'bg-blue-500/10' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase font-bold text-orange-400 tracking-widest">Model B</div>
                    </div>
                    <div className="flex-1 text-sm text-slate-300 font-serif leading-relaxed p-2 bg-black/20 rounded border border-white/5">
                        {modelB}
                    </div>
                    {!readOnly && (
                        <button
                            onClick={() => setSelectedModel('B')}
                            className={`mt-4 py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors ${selectedModel === 'B' ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Choose Model B</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3 bg-white/5 border-t border-white/10 flex justify-center gap-4">
                <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-white transition-colors">
                    <ThumbsDown className="w-3 h-3" /> Both are bad
                </button>
                <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-white transition-colors">
                    <MessageSquare className="w-3 h-3" /> Add Comment
                </button>
            </div>
        </div>
    );
}
