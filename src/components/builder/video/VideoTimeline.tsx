'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from '../types';
import { Play, Pause, SkipBack, SkipForward, Plus, X } from 'lucide-react';

interface VideoSegment {
    id: string;
    start: number;
    end: number;
    label: string;
    color: string;
}

interface VideoTimelineProps {
    src: string;
    component: TaskComponent;
    value: VideoSegment[];
    onChange: (segments: VideoSegment[]) => void;
    readOnly?: boolean;
}

export function VideoTimeline({ src, component, value = [], onChange, readOnly }: VideoTimelineProps) {
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeLabel, setActiveLabel] = useState<string>(component.labels?.[0]?.value || 'Action');

    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (playing) videoRef.current.pause();
            else videoRef.current.play();
            setPlaying(!playing);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current || !videoRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        videoRef.current.currentTime = percentage * duration;
    };

    const addSegment = () => {
        if (readOnly) return;
        const labelConfig = component.labels?.find(l => l.value === activeLabel);
        const newSegment: VideoSegment = {
            id: Math.random().toString(36).substr(2, 9),
            start: currentTime,
            end: Math.min(currentTime + 5, duration),
            label: activeLabel,
            color: labelConfig?.background || '#3b82f6'
        };
        onChange([...value, newSegment]);
    };

    const removeSegment = (id: string) => {
        if (readOnly) return;
        onChange(value.filter(s => s.id !== id));
    };

    const updateSegment = (id: string, start: number, end: number) => {
        if (readOnly) return;
        onChange(value.map(s => s.id === id ? { ...s, start, end } : s));
    };

    return (
        <div className="flex flex-col gap-4 border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden">
            {/* Video Player */}
            <div className="relative aspect-video bg-black">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                />

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                        </button>
                        <div className="text-xs font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Labels:</span>
                        <div className="flex gap-2">
                            {component.labels?.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => setActiveLabel(l.value)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${activeLabel === l.value ? 'ring-1 ring-white' : 'opacity-60 border-transparent bg-white/5'}`}
                                    style={{ backgroundColor: activeLabel === l.value ? l.background : undefined, borderColor: l.background }}
                                >
                                    {l.value}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={addSegment}
                        className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-3 h-3" /> ADD SEGMENT
                    </button>
                </div>

                <div className="relative h-24 bg-white/5 rounded-lg border border-white/10 overflow-hidden select-none">
                    {/* Time Grid / Ruler */}
                    <div className="absolute inset-0 flex pointer-events-none opacity-10">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-white" />
                        ))}
                    </div>

                    {/* Segments Display */}
                    <div className="absolute inset-0 top-6 bottom-6 px-1">
                        {value.map(segment => (
                            <div
                                key={segment.id}
                                className="absolute h-full rounded border group cursor-move"
                                style={{
                                    left: `${(segment.start / duration) * 100}%`,
                                    width: `${((segment.end - segment.start) / duration) * 100}%`,
                                    backgroundColor: segment.color + '40',
                                    borderColor: segment.color
                                }}
                            >
                                <div className="absolute -top-5 left-0 text-[8px] font-bold text-white uppercase truncate px-1" style={{ backgroundColor: segment.color }}>
                                    {segment.label}
                                </div>
                                {!readOnly && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeSegment(segment.id); }}
                                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-2 h-2" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Timeline Interaction Area */}
                    <div
                        ref={timelineRef}
                        className="absolute inset-0 cursor-pointer"
                        onClick={handleTimelineClick}
                    />

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-yellow-400 rotate-45" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
}
