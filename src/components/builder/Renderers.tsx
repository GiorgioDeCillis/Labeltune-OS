'use client';
import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from './types';
import { Image as ImageIcon, Music, Type, Video, Activity, FileText, Send, User, MessagesSquare, Bot, Mic, Square, Play, Pause, SkipBack, SkipForward, Search, Loader2, ChevronRight, Check, Copy, RefreshCcw, Sparkles, Paperclip, X, Box } from 'lucide-react';

import dynamic from 'next/dynamic';
const ImageCanvas = dynamic(() => import('@/components/builder/canvas/ImageCanvas').then(mod => mod.ImageCanvas), { ssr: false });
const TextSpanLabeler = dynamic(() => import('@/components/builder/nlp/TextSpanLabeler').then(mod => mod.TextSpanLabeler), { ssr: false });
const VideoTimeline = dynamic(() => import('@/components/builder/video/VideoTimeline').then(mod => mod.VideoTimeline), { ssr: false });
const AudioSpectrogram = dynamic(() => import('@/components/builder/audio/AudioSpectrogram').then(mod => mod.AudioSpectrogram), { ssr: false });

import { getDefaultAvatar } from '@/utils/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import Minimap from 'wavesurfer.js/dist/plugins/minimap.esm.js';

// --- Objects ---

export function VideoObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="rounded-lg overflow-hidden border border-white/10 relative bg-black/40 aspect-video flex flex-col">
                {src ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <video src={src} className="w-full flex-1" controls />
                        <div className="h-1 bg-primary/30 w-full relative">
                            <div className="absolute inset-y-0 left-0 bg-primary w-1/3" />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <Video className="w-12 h-12 opacity-20" />
                        <div className="text-center">
                            <p className="font-bold text-sm">Video Player Placeholder</p>
                            <p className="text-xs opacity-50">Link data to {component.value}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TimeSeriesObject({ component, data }: { component: TaskComponent, data: any }) {
    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Activity className="w-4 h-4 text-primary" />
                        {component.title || 'TimeSeries'}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">00:00:00 - 00:05:00</div>
                </div>
                <div className="h-32 flex items-end gap-[2px]">
                    {Array.from({ length: 120 }).map((_, i) => {
                        // Deterministic height based on index to avoid hydration mismatch
                        const height = 20 + ((i * 13) % 80);
                        return (
                            <div
                                key={i}
                                className="flex-1 bg-primary/20 rounded-full"
                                style={{ height: `${height}%` }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function PDFObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="bg-white/5 border border-white/10 rounded-lg aspect-[3/4] flex flex-col overflow-hidden relative group">
                <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold truncate max-w-[150px]">{component.value}.pdf</span>
                    </div>
                </div>
                {src ? (
                    <iframe src={src} className="w-full flex-1 invert border-none grayscale opacity-80" />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <FileText className="w-12 h-12 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-30 italic">PDF Document Preview</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function MultiMessageObject({ component, data }: { component: TaskComponent, data: any }) {
    const messages = component.value?.startsWith('$') ? data[component.value.substring(1)] : [];

    const mockMessages = [
        { role: 'user', content: 'Explain quantum computing in simple terms.' },
        { role: 'assistant', content: 'Quantum computing uses quantum mechanics to solve complex problems faster than classical computers...' }
    ];

    const displayMessages = Array.isArray(messages) && messages.length > 0 ? messages : mockMessages;

    return (
        <div className="space-y-4">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                <MessagesSquare className="w-4 h-4" />
                Conversation History
            </div>
            {displayMessages.map((msg: any, i: number) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/5 border border-white/10 text-foreground'
                        }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                            {/* In a real task, we'd have the user name here, for now default to general Ghibli */}
                            <img src={getDefaultAvatar()} alt="User" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function ImageObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="rounded-lg overflow-hidden border border-white/10 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src ? (
                    <img src={src} alt={component.name} className="w-full object-contain max-h-[500px]" />
                ) : (
                    <div className="bg-white/5 h-64 flex items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span>No image data ({component.value})</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TextObject({ component, data }: { component: TaskComponent, data: any }) {
    const text = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.text;

    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-lg">
                {text || <span className="text-muted-foreground italic">No text data</span>}
            </div>
        </div>
    );
}

export function AudioObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-2">
            {component.title && <label className="text-sm font-bold block mb-1">{component.title}</label>}
            {component.description && (
                <div className="text-xs text-muted-foreground mb-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                    {src ? (
                        <audio controls src={src} className="w-full h-8" />
                    ) : (
                        <span className="text-muted-foreground text-sm">No audio data ({component.value})</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function HeaderComponent({ component }: { component: TaskComponent }) {
    return (
        <div className="mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold mb-2">
                {component.title || component.text || component.value || 'Header'}
            </h3>
            {component.description && (
                <div className="prose prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}

export function HyperTextObject({ component, data }: { component: TaskComponent, data: any }) {
    const content = component.value?.startsWith('$') ? data[component.value.substring(1)] : (component.content || component.text || component.description || component.title);

    return (
        <div className="prose prose-invert max-w-none text-foreground/90">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || ''}
            </ReactMarkdown>
        </div>
    );
}

export function ViewLayout({ component, children }: { component: TaskComponent, children?: React.ReactNode }) {
    return (
        <div className="space-y-6 w-full mb-8">
            {(component.title || component.description) && (
                <div className="space-y-2 mb-4">
                    {component.title && <h4 className="text-lg font-bold text-foreground/80">{component.title}</h4>}
                    {component.description && (
                        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

// ... rest of the file ...

// --- Controls ---

export function ChoicesControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);

    const toggle = (val: string) => {
        if (readOnly) return;
        onChange([val]);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <div className="grid gap-2">
                {component.options?.map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selected.includes(opt.value)
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                        } ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                            type="radio"
                            name={component.id}
                            checked={selected.includes(opt.value)}
                            onChange={() => toggle(opt.value)}
                            className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export function RatingControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    // Use options if defined, otherwise default to 1-5
    const ratingOptions = component.options?.length
        ? component.options
        : [1, 2, 3, 4, 5].map(n => ({ label: String(n), value: String(n) }));

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}{component.required && <span className="text-red-500 ml-1">*</span>}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <div className="flex gap-2 flex-wrap">
                {ratingOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => !readOnly && onChange(opt.value)}
                        disabled={readOnly}
                        className={`min-w-8 h-8 px-2 rounded-full flex items-center justify-center font-bold text-sm transition-all ${value === opt.value
                            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-110'
                            : 'bg-white/10 hover:bg-white/20 text-muted-foreground'
                            } ${readOnly ? 'pointer-events-none' : ''}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function TextAreaControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}{component.required && <span className="text-red-500 ml-1">*</span>}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                rows={4}
                placeholder={component.placeholder}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none disabled:opacity-50"
            />
        </div>
    );
}

export function ImageLabelsControl({ component, value, onChange, readOnly, data }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean,
    data: any
}) {
    // Check if we are in "Simple Tag" mode or "Region" mode
    const isRegionMode = component.type === 'RectangleLabels' ||
        component.type === 'PolygonLabels' ||
        component.type === 'BrushLabels' ||
        component.type === 'KeypointLabels' ||
        component.type === 'EllipseLabels' ||
        component.type === 'RelationLabels';

    // Find linked image data if present
    // Usually 'toName' points to the Image object. We need to find the Image component to get its 'value' (src).
    // For now, let's assume the user configures the 'value' of THIS component to be '$image' just like the image object, 
    // OR we look for the component with name == toName[0].
    // Simplified: we expect `component.value` to be set to the variable name (e.g. '$image') for the canvas to render the image background.

    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    if (isRegionMode) {
        if (!src) return <div className="p-4 border border-red-500 rounded text-red-500">Error: Image source not configured for regions.</div>;

        return (
            <div className="space-y-3">
                <ImageCanvas
                    src={src}
                    component={component}
                    value={value || []}
                    onChange={onChange}
                    readOnly={readOnly}
                />
            </div>
        );
    }

    // Check for NER Mode (Text Spans)
    // If component.toName points to a Text object, OR if value is reference to text
    // Simplified: If we are 'Labels' type and we have a 'value' starting with '$' that resolves to infinite text? 
    // Or we explicitly check if it's acting on Text.
    // For this MVP, let's assume if the component has 'text' property or linked data for text, we use NER.
    // OR if type is 'Labels' and we want NER, we should probably have a distinct type 'TextLabels' or 'NERLabels'.
    // BUT the task asked for NER.
    // Let's use logic: if 'component.type' is 'Labels' AND 'component.value' refers to a string in data, treat as NER?
    // No, standard 'Labels' just adds tags.
    // Let's add explicit check: if component.granularity === 'word' or 'char' etc.

    const isNER = component.type === 'Labels' && component.granularity === 'symbol'; // Using granularity to detect NER intent

    if (isNER) {
        const textContent = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.text;
        if (!textContent) return <div className="p-4 border border-red-500 rounded text-red-500">Error: Text source not found for NER.</div>;

        return (
            <div className="space-y-3">
                <TextSpanLabeler
                    text={textContent}
                    component={component}
                    value={value || []}
                    onChange={onChange}
                    readOnly={readOnly}
                />
            </div>
        );
    }

    // Legacy "Tags" Mode
    const selected = Array.isArray(value) ? value : [];

    const toggle = (val: string) => {
        if (readOnly) return;
        if (selected.includes(val)) {
            onChange(selected.filter((s: string) => s !== val));
        } else {
            onChange([...selected, val]);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {component.labels?.map((label) => (
                    <button
                        key={label.value}
                        onClick={() => toggle(label.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selected.includes(label.value)
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-background'
                            : 'opacity-70 hover:opacity-100'
                            }`}
                        style={{
                            backgroundColor: label.background || '#333',
                            color: '#fff' // Assuming dark background for labels usually
                        }}
                    >
                        {label.value}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function VideoTimelineControl({ component, value, onChange, readOnly, data }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean,
    data: any
}) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-3">
            <VideoTimeline
                src={src}
                component={component}
                value={value || []}
                onChange={onChange}
                readOnly={readOnly}
            />
        </div>
    );
}

export function AudioSpectrogramControl({ component, value, onChange, readOnly, data }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean,
    data: any
}) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="space-y-3">
            <AudioSpectrogram
                src={src}
                component={component}
                value={value || []}
                onChange={onChange}
                readOnly={readOnly}
            />
        </div>
    );
}

export function AudioRecorderControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordingUrl, setRecordingUrl] = useState<string | null>(value);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [zoom, setZoom] = useState(20); // Increased initial zoom
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial value might be the recording URL
    useEffect(() => {
        if (value && typeof value === 'string') {
            setRecordingUrl(value);
        }
    }, [value]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current || !recordingUrl) return;

        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#4f4f4f',
            progressColor: '#ffffff',
            cursorColor: '#3b82f6',
            barWidth: 2,
            barRadius: 3,
            height: 80,
            normalize: true,
            hideScrollbar: true,
            minPxPerSec: Math.max(20, zoom),
            formatTime: (seconds: number) => {
                const m = Math.floor(seconds / 60);
                const s = Math.floor(seconds % 60);
                const ms = Math.floor((seconds % 1) * 1000);
                return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
            },
            plugins: [
                Timeline.create({
                    height: 25,
                    style: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '10px',
                    },
                    timeInterval: (pxPerSec: number) => {
                        if (pxPerSec >= 500) return 0.1
                        if (pxPerSec >= 200) return 0.5
                        if (pxPerSec >= 100) return 1
                        return 2
                    },
                    primaryLabelInterval: (pxPerSec: number) => {
                        if (pxPerSec >= 500) return 1
                        if (pxPerSec >= 200) return 2
                        if (pxPerSec >= 100) return 5
                        return 10
                    },
                    secondaryLabelInterval: (pxPerSec: number) => {
                        if (pxPerSec >= 500) return 0.1
                        if (pxPerSec >= 200) return 0.5
                        if (pxPerSec >= 100) return 1
                        return 2
                    },
                    formatTime: (seconds: number) => {
                        const m = Math.floor(seconds / 60);
                        const s = Math.floor(seconds % 60);
                        const ms = Math.floor((seconds % 1) * 1000);
                        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
                    },
                } as any),
                Minimap.create({
                    height: 15,
                    waveColor: 'rgba(255, 255, 255, 0.05)',
                    progressColor: 'rgba(255, 255, 255, 0.15)',
                    overlayColor: 'rgba(255, 255, 255, 0.1)',
                }),
            ],
        } as any);

        // Manual Hover Label Logic for total control and millisecond precision
        const formatHoverTime = (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            const ms = Math.floor((seconds % 1) * 1000);
            return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        };

        const hoverLabel = document.createElement('div');
        hoverLabel.style.position = 'absolute';
        hoverLabel.style.zIndex = '100';
        hoverLabel.style.pointerEvents = 'none';
        hoverLabel.style.display = 'none';
        hoverLabel.style.background = 'rgba(0, 0, 0, 0.9)';
        hoverLabel.style.color = '#fff';
        hoverLabel.style.padding = '4px 8px';
        hoverLabel.style.borderRadius = '4px';
        hoverLabel.style.fontSize = '11px';
        hoverLabel.style.fontFamily = 'monospace';
        hoverLabel.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        hoverLabel.style.backdropFilter = 'blur(4px)';
        hoverLabel.style.transform = 'translate(-50%, -100%)';
        hoverLabel.style.marginTop = '-10px';

        waveformRef.current?.appendChild(hoverLabel);

        const hoverLine = document.createElement('div');
        hoverLine.style.position = 'absolute';
        hoverLine.style.zIndex = '99';
        hoverLine.style.pointerEvents = 'none';
        hoverLine.style.display = 'none';
        hoverLine.style.top = '0';
        hoverLine.style.bottom = '0';
        hoverLine.style.width = '1px';
        hoverLine.style.background = 'rgba(255, 255, 255, 0.4)';

        waveformRef.current?.appendChild(hoverLine);

        const handleMouseMove = (e: MouseEvent) => {
            if (!waveformRef.current || !wavesurferRef.current) return;
            const rect = waveformRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;

            // Account for scroll position and total width when calculating time
            // This ensures accuracy even when zoomed/scrolled or stretched to fit
            const duration = wavesurferRef.current.getDuration();
            if (duration > 0) {
                const scrollWidth = wavesurferRef.current.getWrapper().scrollWidth;
                const scrollLeft = wavesurferRef.current.getScroll();
                const time = ((x + scrollLeft) / scrollWidth) * duration;

                hoverLabel.style.display = 'block';
                hoverLabel.style.left = `${x}px`;
                hoverLabel.style.top = `0px`;
                hoverLabel.textContent = formatHoverTime(Math.max(0, Math.min(time, duration)));

                hoverLine.style.display = 'block';
                hoverLine.style.left = `${x}px`;
            }
        };

        const handleMouseLeave = () => {
            hoverLabel.style.display = 'none';
            hoverLine.style.display = 'none';
        };

        waveformRef.current?.addEventListener('mousemove', handleMouseMove);
        waveformRef.current?.addEventListener('mouseleave', handleMouseLeave);

        wavesurferRef.current.on('play', () => setIsPlaying(true));
        wavesurferRef.current.on('pause', () => setIsPlaying(false));
        wavesurferRef.current.on('finish', () => setIsPlaying(false));
        wavesurferRef.current.on('ready', () => {
            setIsReady(true);
            if (wavesurferRef.current) {
                // Apply initial zoom and speed once ready
                try {
                    wavesurferRef.current.zoom(zoom);
                    wavesurferRef.current.setPlaybackRate(playbackSpeed);
                } catch (e) {
                    console.error('Error applying initial WaveSurfer settings:', e);
                }
            }
        });

        try {
            wavesurferRef.current.load(recordingUrl);
        } catch (e) {
            console.error('Error loading audio into WaveSurfer:', e);
        }

        return () => {
            waveformRef.current?.removeEventListener('mousemove', handleMouseMove);
            waveformRef.current?.removeEventListener('mouseleave', handleMouseLeave);
            if (hoverLabel.parentNode) hoverLabel.parentNode.removeChild(hoverLabel);
            if (hoverLine.parentNode) hoverLine.parentNode.removeChild(hoverLine);
            if (wavesurferRef.current) {
                try {
                    wavesurferRef.current.destroy();
                } catch (e) {
                    // Ignore destroy errors (like AbortError when a fetch is in progress)
                    console.warn('WaveSurfer destroy warning:', e);
                }
            }
        };
    }, [recordingUrl]);

    // Update zoom
    useEffect(() => {
        if (wavesurferRef.current && isReady) {
            try {
                wavesurferRef.current.zoom(zoom);
            } catch (e) {
                console.error('WaveSurfer zoom error:', e);
            }
        }
    }, [zoom, isReady]);

    // Update speed
    useEffect(() => {
        if (wavesurferRef.current && isReady) {
            try {
                wavesurferRef.current.setPlaybackRate(playbackSpeed);
            } catch (e) {
                console.error('WaveSurfer playback rate error:', e);
            }
        }
    }, [playbackSpeed, isReady]);

    const performTranscription = async (base64Audio: string) => {
        setIsTranscribing(true);
        try {
            const response = await fetch('/api/audio/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio }),
            });
            const result = await response.json();
            if (result.text) {
                // We emit a special event or use a naming convention to autofill
                // For now, we'll dispatch a custom event that TaskRenderer can listen to
                // or we can handle it via a new prop if we change the signature.
                // Given the current architecture, a domestic event is easy.
                window.dispatchEvent(new CustomEvent('audio-transcription-complete', {
                    detail: { text: result.text }
                }));
            }
        } catch (error) {
            console.error('Transcription failed:', error);
        } finally {
            setIsTranscribing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordingUrl(url);

                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    onChange(base64data);
                    performTranscription(base64data);
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
            const startTime = Date.now();
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(Date.now() - startTime);
            }, 50);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Please allow microphone access to record audio.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const togglePlayPause = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    const skipBack = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.skip(-5);
        }
    };

    const skipForward = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.skip(5);
        }
    };

    const formatDuration = (ms: number, showMs = true) => {
        const totalSeconds = ms / 1000;
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        if (!showMs) return `${m}:${s.toString().padStart(2, '0')}`;
        const milli = Math.floor(ms % 1000);
        return `${m}:${s.toString().padStart(2, '0')}.${milli.toString().padStart(3, '0')}`;
    };

    return (
        <div className="space-y-4 glass-wavesurfer">
            <style jsx global>{`
                .glass-wavesurfer ::part(minimap) {
                    border-radius: 8px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05) !important;
                    margin-top: 12px;
                    cursor: pointer;
                    pointer-events: auto !important;
                    touch-action: none;
                }
                .glass-wavesurfer ::part(minimap-overlay) {
                    border-radius: 99px;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    background-color: rgba(255, 255, 255, 0.3) !important;
                    cursor: grab;
                    pointer-events: auto !important;
                }
                .glass-wavesurfer ::part(minimap-overlay):active {
                    cursor: grabbing;
                }
                /* Platform-consistent scrollbar for the waveform if it overflows */
                .glass-wavesurfer ::-webkit-scrollbar {
                    height: 6px;
                    display: block !important;
                }
                .glass-wavesurfer ::-webkit-scrollbar-track {
                    background: transparent;
                }
                .glass-wavesurfer ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .glass-wavesurfer ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={`bg-[#121212] border border-white/10 rounded-xl p-6 transition-all ${isRecording ? 'ring-2 ring-red-500/50' : ''} relative overflow-hidden`}>
                {isTranscribing && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Transcribing Audio...</span>
                    </div>
                )}

                {!recordingUrl && !isRecording && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <button
                            onClick={startRecording}
                            disabled={readOnly}
                            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                        </button>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Start Recording</span>
                    </div>
                )}

                {isRecording && (
                    <div className="flex flex-col items-center justify-center gap-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-2xl font-mono font-bold">{formatDuration(duration, false)}</span>
                        </div>
                        <button
                            onClick={stopRecording}
                            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group"
                        >
                            <Square className="w-6 h-6 text-white group-hover:scale-110 transition-transform fill-white" />
                        </button>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Stop Recording</span>
                    </div>
                )}

                {recordingUrl && !isRecording && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Recording</span>
                            {!readOnly && (
                                <button
                                    onClick={() => {
                                        setRecordingUrl(null);
                                        onChange(null);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                                >
                                    Discard & Re-record
                                </button>
                            )}
                        </div>

                        <div className="relative bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm overflow-visible glass-wavesurfer">
                            <div ref={waveformRef} className="w-full relative" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => wavesurferRef.current?.stop()}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                                >
                                    <Square className="w-4 h-4 fill-white" />
                                </button>
                                <button
                                    onClick={skipBack}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                                >
                                    <SkipBack className="w-4 h-4 fill-white" />
                                </button>
                                <button
                                    onClick={togglePlayPause}
                                    className="p-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                </button>
                                <button
                                    onClick={skipForward}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                                >
                                    <SkipForward className="w-4 h-4 fill-white" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex-1 max-w-xs">
                                <Search className="w-4 h-4 text-white/40" />
                                <input
                                    type="range"
                                    min="1"
                                    max="1000"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseInt(e.target.value))}
                                    className="flex-1 accent-primary h-1 bg-white/10 rounded-lg cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                                {[0.5, 0.75, 1, 1.5, 2].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${playbackSpeed === speed
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/40 hover:text-white/60'
                                            }`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


// --- Pogo Rubrics Workflow Components ---

import { Pin, ChevronDown, ChevronUp, AlertTriangle, GripVertical, Minus } from 'lucide-react';

export function InstructionBlock({ component, data }: { component: TaskComponent, data?: any }) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isPinned, setIsPinned] = React.useState(false);

    return (
        <div className={`rounded-xl border ${isPinned ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'} overflow-hidden transition-all`}>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    {component.title}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className={`p-2 rounded-lg transition-all ${isPinned ? 'bg-primary/20 text-primary' : 'hover:bg-white/10 text-muted-foreground'}`}
                    >
                        <Pin className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground"
                    >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            {!isCollapsed && (
                <div className="p-4 space-y-4 text-sm leading-relaxed">
                    {(component.content || component.text) && (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.content || component.text || ''}</ReactMarkdown>
                        </div>
                    )}
                    {component.children?.map((child, i) => (
                        <div key={child.id || i} className="pl-4 border-l-2 border-yellow-500/50 py-1 text-yellow-200/80 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="prose prose-invert prose-xs max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{child.text || ''}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RequirementPanel({ component }: { component: TaskComponent }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{component.title || 'Task Requirements'}</h4>
            {(component.text || component.content) && (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.content || component.text || ''}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}

export function SideBySideLayout({ component, children, data }: { component: TaskComponent, children?: React.ReactNode, data?: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {component.children?.map((child, i) => (
                <div key={child.id || i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4 flex flex-col">
                    <h4 className="font-bold text-sm border-b border-white/5 pb-2">{child.title || `Response ${String.fromCharCode(65 + i)}`}</h4>
                    <div className="flex-1 text-sm leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{child.content || child.text || 'No content'}</ReactMarkdown>
                    </div>
                </div>
            ))}
            {children}
        </div>
    );
}

export function RubricScorerControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const scores = value || {};

    const handleScore = (criterionId: string, score: 'full' | 'partial' | 'none') => {
        if (readOnly) return;
        onChange({ ...scores, [criterionId]: score });
    };

    const getScoreStyle = (score: string | undefined) => {
        switch (score) {
            case 'full': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'none': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-white/5 text-muted-foreground border-white/10';
        }
    };

    const getScorePoints = (criterion: any, score: string | undefined) => {
        const basePoints = criterion.points || 0;
        switch (score) {
            case 'full': return basePoints;
            case 'partial': return Math.floor(basePoints * 0.6);
            case 'none': return 0;
            default: return null;
        }
    };

    return (
        <div className="space-y-3">
            <h4 className="font-bold text-sm">{component.title}</h4>
            <div className="space-y-2">
                {component.rubricCriteria?.map((criterion) => {
                    const currentScore = scores[criterion.id];
                    const points = getScorePoints(criterion, currentScore);

                    return (
                        <div key={criterion.id} className={`rounded-xl border p-4 transition-all ${getScoreStyle(currentScore)}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{criterion.title}</p>
                                    {criterion.category && (
                                        <span className="text-[10px] uppercase tracking-wider opacity-60">{criterion.category}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {points !== null && (
                                        <span className="text-xs font-bold">+{points}pts</span>
                                    )}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleScore(criterion.id, 'full')}
                                            disabled={readOnly}
                                            className={`p-1.5 rounded-lg transition-all ${currentScore === 'full' ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-green-500/30'}`}
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleScore(criterion.id, 'partial')}
                                            disabled={readOnly}
                                            className={`p-1.5 rounded-lg transition-all ${currentScore === 'partial' ? 'bg-yellow-500 text-white' : 'bg-white/10 hover:bg-yellow-500/30'}`}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleScore(criterion.id, 'none')}
                                            disabled={readOnly}
                                            className={`p-1.5 rounded-lg transition-all ${currentScore === 'none' ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-red-500/30'}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function RankingControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const ranking = value || component.options?.map(o => o.value) || [];

    const moveUp = (index: number) => {
        if (readOnly || index === 0) return;
        const newRanking = [...ranking];
        [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
        onChange(newRanking);
    };

    const moveDown = (index: number) => {
        if (readOnly || index === ranking.length - 1) return;
        const newRanking = [...ranking];
        [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
        onChange(newRanking);
    };

    const getRankLabel = (index: number) => {
        if (index === 0) return 'Best Response';
        if (index === ranking.length - 1) return 'Worst Response';
        return `Rank ${index + 1}`;
    };

    return (
        <div className="space-y-3">
            <h4 className="font-bold text-sm">{component.title}</h4>
            <div className="space-y-2">
                {ranking.map((item: string, index: number) => {
                    const option = component.options?.find(o => o.value === item);
                    return (
                        <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{getRankLabel(index)}</span>
                                <p className="font-medium text-sm">{option?.label || item}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => moveUp(index)} disabled={readOnly || index === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button onClick={() => moveDown(index)} disabled={readOnly || index === ranking.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function FeedbackControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const text = value || '';
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const minWords = 50; // Default minimum

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <textarea
                value={text}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                rows={5}
                placeholder={component.placeholder || 'Write your justification here...'}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span className={wordCount >= minWords ? 'text-green-400' : 'text-yellow-400'}>
                    {wordCount} words {wordCount < minWords && `(min: ${minWords})`}
                </span>
                {component.required && <span className="text-red-400">* Required</span>}
            </div>
        </div>
    );
}

export function ChecklistControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    // value is an object mapping option values (item names) to booleans
    const checkedItems = value || {};

    const toggleItem = (itemValue: string) => {
        if (readOnly) return;
        onChange({
            ...checkedItems,
            [itemValue]: !checkedItems[itemValue]
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">
                    {component.title} {component.required && <span className="text-red-400">*</span>}
                </label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                {component.options?.map((item) => (
                    <label
                        key={item.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checkedItems[item.value]
                            ? 'bg-primary/20 border-primary/50 text-white'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            } ${readOnly ? 'cursor-default' : ''}`}
                    >
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                toggleItem(item.value);
                            }}
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${checkedItems[item.value]
                                ? 'bg-primary border-primary'
                                : 'border-white/20 bg-background/50'
                                }`}
                        >
                            {checkedItems[item.value] && <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.hint && <p className="text-[10px] opacity-60 mt-0.5">{item.hint}</p>}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

export function AccordionChoicesControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    // value can be a string (single) or string[] (multiple)
    const selected = Array.isArray(value) ? value : (value ? [value] : []);

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleSelection = (val: string) => {
        if (readOnly) return;
        if (component.multiple) {
            const newSelection = selected.includes(val)
                ? selected.filter(s => s !== val)
                : [...selected, val];
            onChange(newSelection);
        } else {
            onChange(val);
        }
    };

    // Parse options into groups
    const groups: { header: string; options: typeof component.options }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    component.options?.forEach(opt => {
        if (opt.label.startsWith('# ')) {
            currentGroup = { header: opt.label.replace('# ', ''), options: [] };
            groups.push(currentGroup);
        } else if (currentGroup) {
            currentGroup.options?.push(opt);
        } else {
            // Options without a group header
            const defaultGroup = groups.find(g => g.header === '');
            if (defaultGroup) {
                defaultGroup.options?.push(opt);
            } else {
                groups.push({ header: '', options: [opt] });
            }
        }
    });

    // Auto-expand first section on mount if none expanded
    useEffect(() => {
        if (expandedSections.length === 0 && groups.length > 0) {
            setExpandedSections([groups[0].header]);
        }
    }, []);

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-bold block mb-1">
                    {component.title} {component.required && <span className="text-red-400">*</span>}
                </label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                {groups.map((group, gIdx) => (
                    <div key={gIdx} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        {group.header && (
                            <button
                                onClick={() => toggleSection(group.header)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            >
                                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{group.header}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedSections.includes(group.header) ? 'rotate-90' : ''}`} />
                            </button>
                        )}
                        <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(group.header) || !group.header ? 'max-h-[1000px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-2 space-y-1">
                                {group.options?.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selected.includes(opt.value)
                                            ? 'bg-primary/20 text-white shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]'
                                            : 'hover:bg-white/5 text-muted-foreground'
                                            } ${readOnly ? 'cursor-default' : ''}`}
                                    >
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleSelection(opt.value);
                                            }}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(opt.value)
                                                ? 'border-primary bg-primary/20'
                                                : 'border-white/20'
                                                }`}
                                        >
                                            {selected.includes(opt.value) && (
                                                <div className={`w-2.5 h-2.5 rounded-full bg-primary ${component.multiple ? 'rounded-sm' : ''}`} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{opt.label}</p>
                                            {opt.hint && <p className="text-[10px] opacity-60">{opt.hint}</p>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RubricTable({ component }: { component: TaskComponent }) {
    // Expected structure in rubicCriteria for this table:
    // [{ title: "Language", category: "Native Fluency", description: "Response uses native, fluent..." }]
    // For simplicity, we can also just pass HTML content if it's easier to build.

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <h4 className="font-bold text-sm tracking-wider uppercase text-muted-foreground">{component.title || 'Rubric Checklist'}</h4>
                {component.description && (
                    <div className="text-xs text-muted-foreground mt-2 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-muted-foreground uppercase tracking-widest font-bold">
                            <th className="p-3 border-b border-white/5">Topic</th>
                            <th className="p-3 border-b border-white/5">SubTopic</th>
                            <th className="p-3 border-b border-white/5">Example / Guideline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {component.rubricCriteria?.map((item, i) => (
                            <tr key={item.id || i} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-bold text-primary/80">{item.title}</td>
                                <td className="p-3 text-muted-foreground">{item.category}</td>
                                <td className="p-3 leading-relaxed">
                                    <div className="prose prose-invert prose-xs max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(component.content || component.text) && (
                <div className="p-4 text-xs italic text-muted-foreground border-t border-white/5 bg-white/5 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.content || component.text || ''}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}

// --- AI Generator ---

import { generateAIResponse } from '@/app/dashboard/projects/[id]/builder/actions';

export function AIResponseGeneratorObject({ component, readOnly }: { component: TaskComponent, readOnly?: boolean }) {
    const [userPrompt, setUserPrompt] = useState('');
    const [referenceText, setReferenceText] = useState('');
    const [showReferenceInput, setShowReferenceInput] = useState(false);

    // Generator states
    const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Generate response for a single generator (internal helper)
    const generateSingle = async (genId: string) => {
        const generator = component.aiConfig?.generators?.find(g => g.id === genId);
        if (!generator) return;

        setIsGenerating(prev => ({ ...prev, [genId]: true }));
        setErrors(prev => ({ ...prev, [genId]: '' }));

        try {
            // Pass both prompt and reference text
            const response = await generateAIResponse(userPrompt, generator, referenceText);
            setResponses(prev => ({ ...prev, [genId]: response }));
        } catch (error: any) {
            console.error(`AI Generation Error (${genId}):`, error);
            setErrors(prev => ({ ...prev, [genId]: error.message || 'Failed to generate response.' }));
        } finally {
            setIsGenerating(prev => ({ ...prev, [genId]: false }));
        }
    };

    // Trigger all generators
    const handleGenerateAll = async () => {
        if (!userPrompt.trim()) return;

        const generators = component.aiConfig?.generators || [];
        // Trigger all in parallel
        generators.forEach(gen => generateSingle(gen.id));
    };

    // Check if any generator is currently running
    const isAnyGenerating = Object.values(isGenerating).some(Boolean);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold block">
                    {component.title || 'AI Assistant'}
                </label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Main Prompt Area */}
            <div className="space-y-4">
                <div className="relative group">
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                        <span>User Prompt</span>
                        <span className={`${userPrompt.length > (component.aiConfig?.referenceTextLimit || 1000) ? 'text-red-400' : ''}`}>
                            {userPrompt.length} chars
                        </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                        <textarea
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            disabled={readOnly || isAnyGenerating}
                            rows={4}
                            placeholder="Ask the AI models something..."
                            className="w-full bg-transparent border-none p-4 text-sm focus:outline-none resize-y min-h-[100px]"
                        />

                        {/* Footer Bar */}
                        <div className="bg-white/5 border-t border-white/10 p-2 flex items-center justify-between">
                            {/* Left: Attachments */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowReferenceInput(!showReferenceInput)}
                                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold ${showReferenceInput || referenceText
                                        ? 'bg-primary/20 text-primary'
                                        : 'hover:bg-white/10 text-muted-foreground hover:text-white'
                                        }`}
                                    title="Add Reference Text"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    {referenceText && (
                                        <span>Reference Added</span>
                                    )}
                                </button>
                            </div>

                            {/* Right: Generate Button */}
                            <button
                                onClick={handleGenerateAll}
                                disabled={readOnly || isAnyGenerating || !userPrompt.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-primary-foreground transition-all shadow-lg shadow-primary/20"
                            >
                                {isAnyGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reference Text Input (Collapsible) */}
                {showReferenceInput && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 relative">
                            <button
                                onClick={() => setShowReferenceInput(false)}
                                className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                <span>Reference Context</span>
                                <span>{referenceText.length} / {component.aiConfig?.referenceTextLimit || 2000} chars</span>
                            </div>
                            <textarea
                                value={referenceText}
                                onChange={(e) => setReferenceText(e.target.value)}
                                disabled={readOnly || isAnyGenerating}
                                rows={6}
                                placeholder="Paste relevant context, articles, or data here..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 resize-y"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Generated Responses Grid */}
            <div className={`grid grid-cols-1 ${component.aiConfig?.generators?.length && component.aiConfig.generators.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                {component.aiConfig?.generators?.map((gen) => (
                    <div key={gen.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full min-h-[300px]">
                        <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-bold text-sm">{gen.name}</span>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider ml-auto">
                                {gen.provider === 'platform' ? 'Platform' : gen.model || gen.provider}
                            </span>
                        </div>

                        <div className="flex-1 p-4 bg-black/20 text-sm relative overflow-y-auto max-h-[500px] custom-scrollbar">
                            {/* Empty State */}
                            {!responses[gen.id] && !isGenerating[gen.id] && !errors[gen.id] && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 p-4 text-center opacity-30">
                                    <Bot className="w-8 h-8" />
                                    <span>Waiting for prompt...</span>
                                </div>
                            )}

                            {/* Loading State - independent per card */}
                            {isGenerating[gen.id] && !responses[gen.id] && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>
                                </div>
                            )}

                            {/* Error State */}
                            {errors[gen.id] && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                                    <p className="font-bold mb-1">Generation Failed</p>
                                    <p>{errors[gen.id]}</p>
                                </div>
                            )}

                            {/* Response */}
                            {responses[gen.id] && (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{responses[gen.id]}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer - Copy support etc */}
                        {responses[gen.id] && (
                            <div className="p-2 border-t border-white/10 bg-white/5 flex justify-end">
                                <button
                                    onClick={() => navigator.clipboard.writeText(responses[gen.id])}
                                    className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {(!component.aiConfig?.generators?.length) && (
                <div className="text-center p-8 bg-white/5 border border-dashed border-white/10 rounded-xl text-muted-foreground">
                    No AI generators configured for this component.
                </div>
            )}
        </div>
    );
}
