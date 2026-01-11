'use client';

import React, { useState } from 'react';
import { TaskComponent } from '../types';
import { AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface HallucinationHighlighterProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
}

export function HallucinationHighlighter({ component, value, readOnly }: HallucinationHighlighterProps) {
    const text = "The James Webb Space Telescope (JWST) was launched in 2015. It primarily observes in the ultraviolet spectrum to study the formation of the first galaxies.";
    // Simulated errors: 2015 -> 2021, ultraviolet -> infrared

    const [highlights, setHighlights] = useState<any[]>([
        { start: 42, end: 46, type: 'fact_error', comment: 'Launched in 2021' },
        { start: 73, end: 84, type: 'context_error', comment: 'Primarily Infrared' }
    ]);

    return (
        <div className="w-full bg-slate-900 border border-white/10 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-slate-200">Factuality Check</span>
                </div>
                <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div> Fact Error
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div> Logic Error
                    </span>
                </div>
            </div>

            <div className="p-6 text-base font-serif leading-8 text-slate-300 tracking-wide">
                The James Webb Space Telescope (JWST) was launched in
                <span className="mx-1 bg-red-500/20 border-b-2 border-red-500 text-red-200 px-1 relative group cursor-help">
                    2015
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-white p-2 rounded w-40 shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Correction: 2021
                    </span>
                </span>.
                It primarily observes in the
                <span className="mx-1 bg-yellow-500/20 border-b-2 border-yellow-500 text-yellow-200 px-1 relative group cursor-help">
                    ultraviolet spectrum
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-white p-2 rounded w-40 shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Correction: Infrared
                    </span>
                </span>
                to study the formation of the first galaxies.
            </div>

            {!readOnly && (
                <div className="bg-slate-950 p-3 border-t border-white/10 flex items-center gap-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for citations or Verify facts..."
                        className="bg-transparent border-none text-sm text-white focus:outline-none flex-1"
                    />
                    <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors">
                        Auto-Verify
                    </button>
                </div>
            )}
        </div>
    );
}
