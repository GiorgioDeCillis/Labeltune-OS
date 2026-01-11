'use client';

import React, { useState, useRef } from 'react';
import { TaskComponent } from '../types';
import { FileText, Type, Target, Eraser, Scan } from 'lucide-react';

interface OCRFormExtractorProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
    height?: string;
}

interface Box {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    field: string;
    text: string;
}

export function OCRFormExtractor({ component, value, readOnly, height = "600px" }: OCRFormExtractorProps) {
    const [scale, setScale] = useState(1);
    const [boxes, setBoxes] = useState<Box[]>([
        { id: '1', x: 120, y: 80, w: 200, h: 40, field: 'Invoice #', text: 'INV-2024-001' },
        { id: '2', x: 400, y: 80, w: 150, h: 40, field: 'Date', text: 'Jan 12, 2026' },
        { id: '3', x: 120, y: 200, w: 430, h: 100, field: 'Bill To', text: 'Acme Corp\n123 Tech Blvd\nSan Francisco, CA' }
    ]);
    const [selectedBox, setSelectedBox] = useState<string | null>(null);

    // Mock document image simply using a styled div for now to avoid external image dependencies
    // In production, this would use pdf.js canvas or an img tag

    const handleBoxClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBox(id);
    };

    return (
        <div className="flex flex-col border border-white/10 rounded-lg bg-[#202020] overflow-hidden" style={{ height }}>
            {/* Toolbar */}
            <div className="bg-[#1a1a1a] border-b border-white/10 p-2 flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">Form Extractor</span>
                </div>
                <button className="p-2 hover:bg-white/10 rounded" title="Draw Region">
                    <Scan className="w-4 h-4 text-slate-300" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded" title="Text Select">
                    <Type className="w-4 h-4 text-slate-300" />
                </button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-xs text-muted-foreground">{boxes.length} Fields Extracted</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Document View */}
                <div className="flex-1 bg-[#2a2a2a] relative overflow-auto flex items-center justify-center p-8">
                    <div
                        className="bg-white text-black shadow-2xl relative"
                        style={{
                            width: '595px', // A4 proportionate
                            height: '842px',
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        {/* Mock Content */}
                        <div className="p-12 space-y-8 font-serif opacity-30 select-none pointer-events-none">
                            <h1 className="text-4xl font-bold mb-8">INVOICE</h1>
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <p className="font-bold">Invoice To:</p>
                                    <p>Acme Corp</p>
                                    <p>123 Tech Blvd</p>
                                    <p>San Francisco, CA</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p><span className="font-bold">Invoice #:</span> INV-2024-001</p>
                                    <p><span className="font-bold">Date:</span> Jan 12, 2026</p>
                                </div>
                            </div>
                            <div className="mt-12 border-t-2 border-black pt-4">
                                <div className="flex justify-between font-bold mb-4">
                                    <span>Description</span>
                                    <span>Amount</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 pb-2">
                                    <span>Consulting Services</span>
                                    <span>$5,000.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Overlay Boxes */}
                        {boxes.map(box => (
                            <div
                                key={box.id}
                                onClick={(e) => handleBoxClick(box.id, e)}
                                className={`absolute border-2 transition-all cursor-pointer group flex flex-col justify-between
                                    ${selectedBox === box.id ? 'border-blue-500 bg-blue-500/10 z-10' : 'border-green-500/50 hover:border-green-500 hover:bg-green-500/5'}
                                `}
                                style={{
                                    left: box.x,
                                    top: box.y,
                                    width: box.w,
                                    height: box.h
                                }}
                            >
                                <span className={`text-[10px] px-1 font-bold truncate -mt-4 absolute
                                     ${selectedBox === box.id ? 'text-blue-600 bg-white' : 'text-green-600 bg-white/80'}
                                `}>
                                    {box.field}
                                </span>
                                {selectedBox === box.id && (
                                    <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Extracted Data</h4>
                        <div className="space-y-3">
                            {boxes.map(box => (
                                <div
                                    key={box.id}
                                    onClick={() => setSelectedBox(box.id)}
                                    className={`p-3 rounded border text-sm cursor-pointer transition-colors
                                        ${selectedBox === box.id
                                            ? 'bg-blue-500/10 border-blue-500/50'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                    `}
                                >
                                    <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">{box.field}</div>
                                    <div className="text-white font-mono">{box.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {!readOnly && (
                        <div className="p-4 mt-auto border-t border-white/10">
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition-colors">
                                Validated & Save
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
