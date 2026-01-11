'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Play, Pause, Volume2, Plus, X, Activity as WaveformIcon } from 'lucide-react';

interface AudioAnnotation {
    id: string;
    start: number;
    end: number;
    label: string;
    color: string;
}

interface AudioSpectrogramProps {
    src: string;
    component: TaskComponent;
    value: AudioAnnotation[];
    onChange: (annotations: AudioAnnotation[]) => void;
    readOnly?: boolean;
}

export function AudioSpectrogram({ src, component, value = [], onChange, readOnly }: AudioSpectrogramProps) {
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeLabel, setActiveLabel] = useState<string>(component.labels?.[0]?.value || 'Voice');

    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    // Draw Mock Spectrogram
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Draw some "spectrogram" noise/patterns
        for (let x = 0; x < width; x++) {
            for (let i = 0; i < 5; i++) {
                const y = Math.random() * height;
                const opacity = Math.random() * 0.5;
                ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`; // Violet
                ctx.fillRect(x, y, 1, 2);
            }
        }

        // Draw basic waveform
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x++) {
            const y = (Math.sin(x * 0.05) * 20) + (height / 2);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

    }, [src]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (playing) audioRef.current.pause();
            else audioRef.current.play();
            setPlaying(!playing);
        }
    };

    const addAnnotation = () => {
        if (readOnly) return;
        const labelConfig = component.labels?.find(l => l.value === activeLabel);
        const newAnn: AudioAnnotation = {
            id: Math.random().toString(36).substr(2, 9),
            start: currentTime,
            end: Math.min(currentTime + 2, duration),
            label: activeLabel,
            color: labelConfig?.background || '#8b5cf6'
        };
        onChange([...value, newAnn]);
    };

    return (
        <div className="flex flex-col gap-4 border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden">
            <audio ref={audioRef} src={src} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

            {/* Spectrogram / Waveform View */}
            <div className="relative h-48 bg-black p-1">
                <canvas ref={canvasRef} width={800} height={200} className="w-full h-full rounded-lg" />

                {/* Annotations Overlay */}
                <div className="absolute inset-0 top-4 bottom-4 px-1 pointer-events-none">
                    {value.map(ann => (
                        <div
                            key={ann.id}
                            className="absolute h-full border rounded transition-all pointer-events-auto"
                            style={{
                                left: `${(ann.start / duration) * 100}%`,
                                width: `${((ann.end - ann.start) / duration) * 100}%`,
                                backgroundColor: ann.color + '33',
                                borderColor: ann.color
                            }}
                        >
                            <div className="absolute -bottom-5 left-0 text-[8px] font-bold text-white uppercase px-1 rounded" style={{ backgroundColor: ann.color }}>
                                {ann.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-px bg-white z-10 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                />
            </div>

            {/* Controls */}
            <div className="p-4 flex items-center justify-between bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="p-3 bg-primary text-primary-foreground rounded-full hover:scale-105 transition-transform">
                        {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-mono">{formatTime(currentTime)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Current Position</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {component.labels?.map(l => (
                            <button
                                key={l.value}
                                onClick={() => setActiveLabel(l.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${activeLabel === l.value ? 'scale-110 shadow-lg shadow-white/10' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                style={{ backgroundColor: l.background, borderColor: activeLabel === l.value ? 'white' : 'transparent' }}
                                title={l.value}
                            >
                                <span className="text-[10px] font-bold text-white uppercase">{l.value[0]}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={addAnnotation}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        <Plus className="w-4 h-4" /> ADD REGION
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    if (isNaN(seconds)) return "0:00.0";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
}
