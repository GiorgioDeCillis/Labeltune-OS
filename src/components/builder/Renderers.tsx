'use client';
import React, { useState, useRef, useEffect } from 'react';
import { TaskComponent } from './types';
import { Image as ImageIcon, Music, Type, Video, Activity, FileText, Send, User, MessagesSquare, Bot, Mic, Square, Play, Pause, SkipBack, SkipForward, Search } from 'lucide-react';
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
                    {Array.from({ length: 120 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-primary/20 rounded-full"
                            style={{ height: `${20 + Math.random() * 80}%` }}
                        />
                    ))}
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
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                        key={num}
                        onClick={() => !readOnly && onChange(num)}
                        disabled={readOnly}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${value === num
                            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-110'
                            : 'bg-white/10 hover:bg-white/20 text-muted-foreground'
                            } ${readOnly ? 'pointer-events-none' : ''}`}
                    >
                        {num}
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

export function ImageLabelsControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    // This is a simplified version. Real Label Studio does regions on the image.
    // For now, we will just treat it as global tags for the image.
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

export function AudioRecorderControl({ component, value, onChange, readOnly }: {
    component: TaskComponent,
    value: any,
    onChange: (val: any) => void,
    readOnly?: boolean
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordingUrl, setRecordingUrl] = useState<string | null>(value);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [zoom, setZoom] = useState(20); // Increased initial zoom
    const [isPlaying, setIsPlaying] = useState(false);

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
            minPxPerSec: zoom,
            plugins: [
                Timeline.create({
                    height: 20,
                    style: {
                        color: '#4f4f4f',
                        fontSize: '10px',
                    },
                    formatTime: (seconds: number) => {
                        const m = Math.floor(seconds / 60);
                        const s = Math.floor(seconds % 60);
                        const ms = Math.floor((seconds % 1) * 1000);
                        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
                    },
                } as any),
                Hover.create({
                    lineColor: '#ffffff40',
                    lineWidth: 1,
                    labelBackground: '#000000',
                    labelColor: '#ffffff',
                    labelSize: '10px',
                    formatTime: (seconds: number) => {
                        const m = Math.floor(seconds / 60);
                        const s = Math.floor(seconds % 60);
                        const ms = Math.floor((seconds % 1) * 1000);
                        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
                    },
                } as any),
                Minimap.create({
                    height: 15,
                    waveColor: '#2a2a2a',
                    progressColor: '#555555',
                    overlayColor: 'rgba(255, 255, 255, 0.05)',
                }),
            ],
        });

        wavesurferRef.current.load(recordingUrl);

        wavesurferRef.current.on('play', () => setIsPlaying(true));
        wavesurferRef.current.on('pause', () => setIsPlaying(false));
        wavesurferRef.current.on('finish', () => setIsPlaying(false));

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, [recordingUrl]);

    // Update zoom
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(zoom);
        }
    }, [zoom]);

    // Update speed
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setPlaybackRate(playbackSpeed);
        }
    }, [playbackSpeed]);

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
                    const base64data = reader.result;
                    onChange(base64data);
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
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

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-bold block mb-1">{component.title}</label>
                {component.description && (
                    <div className="text-xs text-muted-foreground mb-3 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{component.description}</ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={`bg-[#121212] border border-white/10 rounded-xl p-6 transition-all ${isRecording ? 'ring-2 ring-red-500/50' : ''}`}>
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
                            <span className="text-2xl font-mono font-bold">{formatDuration(duration)}</span>
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

                        <div className="relative bg-black/40 rounded-lg p-4 border border-white/5">
                            <div ref={waveformRef} className="w-full" />
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

import { Pin, ChevronDown, ChevronUp, AlertTriangle, GripVertical, Check, X, Minus } from 'lucide-react';

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
