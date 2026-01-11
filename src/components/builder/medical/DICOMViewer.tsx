'use client';

import React, { useState, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Activity, ZoomIn, ZoomOut, Move, Sun, Contrast, Ruler } from 'lucide-react';

interface DICOMViewerProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
    height?: string;
}

export function DICOMViewer({ component, value, readOnly, height = "600px" }: DICOMViewerProps) {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [zoom, setZoom] = useState(1);
    const [currentSlice, setCurrentSlice] = useState(15);
    const totalSlices = 64;

    // Simulated tools
    const tools = [
        { name: 'Zoom', icon: ZoomIn, action: () => setZoom(z => z + 0.1) },
        { name: 'Pan', icon: Move, action: () => { } },
        { name: 'Window/Level', icon: Contrast, action: () => { } },
    ];

    return (
        <div className="flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden" style={{ height }}>
            {/* Toolbar */}
            <div className="bg-[#1a1a1a] border-b border-white/10 p-2 flex items-center gap-2">
                {tools.map(tool => (
                    <button
                        key={tool.name}
                        onClick={tool.action}
                        className="p-2 hover:bg-white/10 rounded flex flex-col items-center justify-center gap-1 min-w-[60px]"
                        title={tool.name}
                    >
                        <tool.icon className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] text-muted-foreground">{tool.name}</span>
                    </button>
                ))}
                <div className="h-8 w-px bg-white/10 mx-2" />
                <div className="flex flex-col gap-1 w-32">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                    </div>
                    <input
                        type="range"
                        min="50" max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Main Viewport */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                    {/* Simulated Medical Image */}
                    <div
                        className="w-[512px] h-[512px] bg-neutral-900 relative transition-transform duration-100 ease-out"
                        style={{
                            transform: `scale(${zoom})`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%)`
                        }}
                    >
                        {/* Placeholder Content simulating a scan */}
                        <div className="absolute inset-0 rounded-full border-[40px] border-neutral-800 opacity-50 blur-sm transform scale-90"></div>
                        <div className="absolute inset-x-[20%] top-[40%] bottom-[40%] bg-neutral-800 blur-md opacity-60"></div>

                        {/* Slice Indicator Text */}
                        <div className="absolute top-4 left-4 text-xs font-mono text-yellow-400">
                            <div>Im: {currentSlice} / {totalSlices}</div>
                            <div>Series: 4</div>
                            <div>Acq: {currentSlice * 2.5}mm</div>
                        </div>

                        <div className="absolute bottom-4 right-4 text-xs font-mono text-white/70">
                            <div>W: 400 L: 40</div>
                            <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
                        </div>
                    </div>

                    {/* Scanning Line Animation (Simulated) */}
                    {!readOnly && (
                        <div className="absolute top-0 bottom-0 w-px bg-blue-500/30 left-1/2 pointer-events-none" />
                    )}
                </div>

                {/* Vertical Slider for Slices */}
                <div className="w-12 bg-[#111] border-l border-white/10 flex flex-col items-center py-4 relative">
                    <div className="absolute inset-y-4 right-[50%] w-1 bg-white/10 rounded-full"></div>
                    <input
                        type="range"
                        {...({ orient: "vertical" } as any)}
                        min="1" max={totalSlices}
                        value={currentSlice}
                        onChange={(e) => setCurrentSlice(Number(e.target.value))}
                        className="h-full w-full opacity-0 cursor-ns-resize absolute z-10"
                        style={{ WebkitAppearance: 'slider-vertical' } as any}
                    />
                    <div
                        className="absolute w-4 h-4 bg-blue-500 rounded-full right-[50%] translate-x-1/2 pointer-events-none transition-all"
                        style={{ top: `${((currentSlice - 1) / totalSlices) * 100}%` }}
                    />
                    <div className="mt-auto text-[10px] font-mono text-muted-foreground pt-2">{currentSlice}</div>
                </div>
            </div>
        </div>
    );
}

