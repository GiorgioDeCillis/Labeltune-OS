'use client';

import React, { useState } from 'react';
import { TaskComponent } from '../types';
import { Microscope, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface WSIViewerProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
}

export function WSIViewer({ component, value, readOnly }: WSIViewerProps) {
    const [zoom, setZoom] = useState(1);

    // In a real implementation this would use OpenSeadragon to load DZI (Deep Zoom Images).
    // Here we simulate the viewport.

    return (
        <div className="w-full h-[600px] border border-white/10 rounded-lg overflow-hidden bg-black relative flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none flex justify-between items-start">
                <div className="bg-black/80 backdrop-blur border border-white/10 p-2 rounded-lg pointer-events-auto flex gap-2">
                    <button className="p-2 hover:bg-white/20 rounded transition-colors" onClick={() => setZoom(z => Math.max(0.5, z - 0.5))}><ZoomOut size={16} /></button>
                    <span className="w-12 flex items-center justify-center font-mono text-xs">{zoom}x</span>
                    <button className="p-2 hover:bg-white/20 rounded transition-colors" onClick={() => setZoom(z => Math.min(40, z + 0.5))}><ZoomIn size={16} /></button>
                </div>

                <div className="bg-primary/20 backdrop-blur border border-primary/30 p-2 rounded-lg pointer-events-auto text-primary text-xs font-bold flex items-center gap-2 animate-pulse">
                    <Microscope size={14} /> Cancer Detection Mode
                </div>
            </div>

            {/* Viewport simulation */}
            <div className="flex-1 overflow-hidden relative cursor-move bg-pink-900/20">
                {/* Mock tissue pattern */}
                <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <div className="w-[800px] h-[600px] bg-pink-100/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-2xl opacity-30 absolute top-1/4 left-1/4"></div>

                    {/* Simulated Cells */}
                    <div className="grid grid-cols-10 gap-8 opacity-40">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-purple-400 blur-[1px]"></div>
                        ))}
                    </div>
                </div>

                {/* Minimap */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/80 border border-white/20 rounded overflow-hidden pointer-events-auto">
                    <div className="w-full h-full bg-pink-500/10 relative">
                        <div className="absolute w-8 h-6 border-2 border-primary top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
