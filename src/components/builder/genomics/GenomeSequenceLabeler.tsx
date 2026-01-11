'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TaskComponent } from '../types';
import { Dna, Activity, Info, AlertTriangle, Layers, Search, ZoomIn, ZoomOut, Play, Loader2 } from 'lucide-react';
import { predictVariantImpact } from '@/app/actions/genomics';
import { useToast } from '@/components/Toast';

interface GenomeSequenceLabelerProps {
    component: TaskComponent;
    value?: any;
    data?: any;
    onChange: (val: any) => void;
    readOnly?: boolean;
}

export function GenomeSequenceLabeler({ component, value, data, onChange, readOnly }: GenomeSequenceLabelerProps) {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    // Data Binding: use real data from dataset if available, fallback to mock for demo
    const sequence = useMemo(() => {
        const rawSeq = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;
        if (rawSeq) return rawSeq;

        const bases = ['A', 'C', 'G', 'T'];
        return Array.from({ length: 1000 }).map(() => bases[Math.floor(Math.random() * 4)]).join('');
    }, [component.value, data]);

    // Initial Predictions Load
    useEffect(() => {
        const rawPreds = data?.predictions_json || data?.alphagenome_output;
        if (rawPreds) {
            setPredictions(Array.isArray(rawPreds) ? rawPreds : JSON.parse(rawPreds));
        } else {
            // Default initial state (empty or basic mock if needed, currently empty to encourage running inference)
            setPredictions(Array.from({ length: 100 }).map((_: any, i: number) => ({
                pos: i * 10,
                splicing: Math.random(),
                accessibility: Math.random(),
                impact: Math.random() > 0.8 ? 'pathogenic' : 'benign'
            })));
        }
    }, [data]);

    const handleRunInference = async () => {
        setIsLoading(true);
        try {
            const newPredictions = await predictVariantImpact(sequence, component.genomicsConfig);
            setPredictions(newPredictions);
            showToast('Analysis Complete: AlphaGenome predictions updated.', 'success');
        } catch (error) {
            showToast('Inference Failed: Could not run AlphaGenome analysis.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const visibleBases = Math.max(10, Math.floor(100 / zoomLevel));
    const startBase = Math.floor(scrollOffset * (sequence.length - visibleBases));
    const displaySequence = sequence.slice(startBase, startBase + visibleBases);

    return (
        <div className="w-full space-y-4 glass-panel p-6 rounded-2xl border border-white/10 bg-black/20">
            {/* Header / Tools */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Dna className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{component.title || 'AlphaGenome Explorer'}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Base Pairs: {sequence.length.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={handleRunInference}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-md text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                        {isLoading ? 'Running Model...' : 'Run Analysis'}
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ZoomOut size={16} /></button>
                    <span className="text-[10px] font-bold px-2">{zoomLevel}x</span>
                    <button onClick={() => setZoomLevel(prev => Math.min(10, prev + 1))} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ZoomIn size={16} /></button>
                </div>
            </div>

            {/* Main Sequence View */}
            <div className="relative group">
                <div className="h-24 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center font-mono text-2xl tracking-[0.5em] overflow-hidden select-none">
                    {displaySequence.split('').map((base: string, i: number) => (
                        <span
                            key={i + startBase}
                            className={`transition-all duration-300 ${base === 'A' ? 'text-green-400' :
                                base === 'C' ? 'text-blue-400' :
                                    base === 'G' ? 'text-yellow-400' : 'text-red-400'
                                }`}
                        >
                            {base}
                        </span>
                    ))}
                </div>
                {/* Positional Markers */}
                <div className="flex justify-between px-2 pt-1 text-[10px] font-mono text-muted-foreground opacity-50">
                    <span>{startBase} bp</span>
                    <span>{startBase + visibleBases} bp</span>
                </div>
            </div>

            {/* AlphaGenome Tracks */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <Activity size={12} /> Prediction Tracks
                </div>

                {/* Splicing Track */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] uppercase">
                        <span>RNA Splicing</span>
                        <span className="text-primary">82% Confidence</span>
                    </div>
                    <div className="h-8 bg-white/5 rounded-md overflow-hidden flex items-end gap-[1px] p-[2px]">
                        {predictions.map((p: any, i: number) => (
                            <div
                                key={i}
                                className="flex-1 bg-primary/40 rounded-t-sm transition-all hover:bg-primary"
                                style={{ height: `${p.splicing * 100}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* DNA Accessibility */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] uppercase">
                        <span>DNA Accessibility</span>
                        <span className="text-amber-400">High Resolution</span>
                    </div>
                    <div className="h-8 bg-white/5 rounded-md overflow-hidden flex items-end gap-[1px] p-[2px]">
                        {predictions.map((p: any, i: number) => (
                            <div
                                key={i}
                                className="flex-1 bg-amber-400/20 rounded-t-sm transition-all hover:bg-amber-400/60"
                                style={{ height: `${p.accessibility * 100}%` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Variant Legend */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="uppercase tracking-widest">Pathogenic</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="uppercase tracking-widest">Benign</span>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                    <Layers size={12} /> View Dataset Details
                </button>
            </div>
        </div>
    );
}

