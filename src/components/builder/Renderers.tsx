import React from 'react';
import { TaskComponent } from './types';
import { Image as ImageIcon, Music, Type, Video, Activity, FileText, Send, User, MessagesSquare, Bot } from 'lucide-react';

// --- Objects ---

export function VideoObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="rounded-lg overflow-hidden border border-white/10 relative bg-black/40 aspect-video flex flex-col">
            {src ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <video src={src} className="w-full flex-1" />
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
    );
}

export function TimeSeriesObject({ component, data }: { component: TaskComponent, data: any }) {
    // Mock waveform for visualization
    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="w-4 h-4 text-primary" />
                    {component.title}
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
    );
}

export function PDFObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg aspect-[3/4] flex flex-col overflow-hidden relative group">
            <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold truncate max-w-[150px]">{component.value}.pdf</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
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
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-6 uppercase tracking-widest">
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
                        {msg.content}
                    </div>
                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function ImageObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    if (!src) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg h-64 flex items-center justify-center text-muted-foreground gap-2">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span>No image data ({component.value})</span>
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden border border-white/10 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={component.name} className="w-full object-contain max-h-[500px]" />
        </div>
    );
}

export function TextObject({ component, data }: { component: TaskComponent, data: any }) {
    const text = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.text;

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-lg">
            {text || <span className="text-muted-foreground italic">No text data</span>}
        </div>
    );
}

export function AudioObject({ component, data }: { component: TaskComponent, data: any }) {
    const src = component.value?.startsWith('$') ? data[component.value.substring(1)] : component.value;

    return (
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
    );
}

export function HeaderComponent({ component }: { component: TaskComponent }) {
    return (
        <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">
            {component.text || component.value || 'Header'}
        </h3>
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
        // Basic single select behavior for now, unless we add 'multiple' prop
        // Label Studio choices are usually radio unless choice="multiple"
        onChange([val]);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-bold block mb-2">{component.title}</label>
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
        <div className="space-y-2">
            <label className="text-sm font-bold block mb-2">{component.title}</label>
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
        <div className="space-y-2">
            <label className="text-sm font-bold block mb-2">{component.title}</label>
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
        <div className="space-y-2">
            <label className="text-sm font-bold block mb-2">{component.title}</label>
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
