'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Upload, Send, User, ChevronLeft, ChevronRight, Loader2, FileText, Layout, GraduationCap, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createInstructionSet, UnifiedInstructionItem } from '../instructions/actions';
import { useToast } from '@/components/Toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { getDefaultAvatar } from '@/utils/avatar';

// Use dynamic import for pdfjs to avoid server-side issues
const getPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    // Set worker source
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    return pdfjs;
};

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AdvisorClient({ instructions, user }: { instructions: UnifiedInstructionItem[], user: any }) {
    const router = useRouter();
    const { showToast } = useToast();
    const [avatarError, setAvatarError] = useState(false);

    // State
    const [selectedInstruction, setSelectedInstruction] = useState<UnifiedInstructionItem | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle File Upload and Parse
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('Initializing PDF parser...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjs = await getPdfJs();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            let accumulatedSections: any[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                setUploadStatus(`Processing page ${i} of ${pdf.numPages}...`);
                const page = await pdf.getPage(i);

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (!context) continue;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas as any,
                }).promise;

                const base64Image = canvas.toDataURL('image/jpeg', 0.6);

                const response = await fetch('/api/instructions/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image }),
                });

                if (!response.ok) {
                    console.error(`Failed to process page ${i}`);
                    continue;
                }

                const data = await response.json();
                if (data.sections && Array.isArray(data.sections)) {
                    // Simple merge for now
                    accumulatedSections = [...accumulatedSections, ...data.sections];
                }
            }

            setUploadStatus('Saving instructions...');

            // Create new instruction set
            const newInst = await createInstructionSet({
                name: file.name.replace('.pdf', ''),
                description: 'Uploaded via Advisor Chat',
                content: accumulatedSections,
                is_uploaded: true
            });

            showToast('Instructions uploaded successfully!', 'success');
            router.refresh();

            if (newInst) {
                const castInst = {
                    id: newInst.id,
                    name: newInst.name,
                    description: newInst.description,
                    content: newInst.content,
                    type: 'uploaded',
                    updated_at: new Date().toISOString()
                } as UnifiedInstructionItem;

                setSelectedInstruction(castInst);
                setMessages([{ role: 'assistant', content: `Hello! I'm ready to discuss the instructions found in "${castInst.name}". \n\nWhat would you like to know?` }]);
            }

        } catch (error) {
            console.error('Upload failed', error);
            showToast('Failed to upload instructions.', 'error');
        } finally {
            setIsUploading(false);
            setUploadStatus('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedInstruction || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/advisor/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    instructionContent: selectedInstruction.content
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            const aiMsg: Message = { role: 'assistant', content: data.message.content };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            showToast('Failed to get AI response.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Selection View
    if (!selectedInstruction) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
                    <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">AI Instruction Advisor</h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
                        Select an instruction set, project guideline, or course to start chatting with our advanced AI.
                        Ask questions, clarify guidelines, or resolve ambiguities in seconds.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg text-white/80 px-2 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Upload className="w-4 h-4 text-primary" />
                            Upload New
                        </h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full glass-panel p-8 rounded-2xl border border-dashed border-white/20 hover:bg-white/5 hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center gap-4 aspect-square"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Processing...</h3>
                                        <p className="text-sm text-muted-foreground">{uploadStatus}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                        <Upload className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Upload PDF</h3>
                                        <p className="text-sm text-muted-foreground max-w-[200px]">AI will parse and extract rules automatically</p>
                                    </div>
                                </>
                            )}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                    </div>

                    {/* Right Columns: Library */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-lg text-white/80 px-2 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Archive className="w-4 h-4 text-primary" />
                            Knowledge Library
                        </h3>
                        <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {instructions.map(inst => {
                                const Icon = {
                                    platform: FileText,
                                    uploaded: Archive,
                                    project: Layout,
                                    course: GraduationCap
                                }[inst.type] || FileText;

                                return (
                                    <button
                                        key={`${inst.type}-${inst.id}`}
                                        onClick={() => {
                                            setSelectedInstruction(inst);
                                            setMessages([{ role: 'assistant', content: `Hello! I'm ready to discuss "${inst.name}". What do you need help with?` }]);
                                        }}
                                        className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group flex items-start gap-4"
                                    >
                                        <div className={`p-3 rounded-xl bg-black/40 text-muted-foreground group-hover:text-primary transition-colors ${inst.type === 'platform' ? 'text-blue-400' :
                                            inst.type === 'uploaded' ? 'text-purple-400' :
                                                inst.type === 'project' ? 'text-amber-400' :
                                                    'text-emerald-400'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white group-hover:text-primary transition-colors truncate">{inst.name}</div>
                                            <div className="text-xs text-muted-foreground/60 flex items-center gap-2 mt-1">
                                                <span className={`uppercase font-black tracking-tighter text-[9px] px-1.5 py-0.5 rounded ${inst.type === 'platform' ? 'bg-blue-500/10 text-blue-400' :
                                                    inst.type === 'uploaded' ? 'bg-purple-500/10 text-purple-400' :
                                                        inst.type === 'project' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                    {inst.type}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>{Array.isArray(inst.content) ? `${inst.content.length} sections` : '1 document'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 ml-auto group-hover:text-white transition-colors self-center" />
                                    </button>
                                );
                            })}

                            {instructions.length === 0 && (
                                <div className="text-center p-12 glass-panel rounded-2xl border-dashed border-2 border-white/5 opacity-50">
                                    <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-bold">Library is empty</h3>
                                    <p className="text-sm text-muted-foreground">Upload or create instructions to see them here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Chat View
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden animate-in fade-in duration-300 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedInstruction(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white shadow-inner"
                        title="Back to selection"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-white flex items-center gap-2 tracking-tight">
                            <Bot className="w-5 h-5 text-primary" />
                            {selectedInstruction.name}
                        </h2>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase font-black tracking-widest">
                            <span className={
                                selectedInstruction.type === 'platform' ? 'text-blue-400' :
                                    selectedInstruction.type === 'uploaded' ? 'text-purple-400' :
                                        selectedInstruction.type === 'project' ? 'text-amber-400' :
                                            'text-emerald-400'
                            }>{selectedInstruction.type} KNOWLEDGE</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-500/80">AI Active</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedInstruction(null)}
                    className="text-xs font-black text-primary hover:text-primary/80 transition-all uppercase tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10"
                >
                    Switch Source
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-black/20 to-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                                <Bot className="w-5.5 h-5.5 text-primary" />
                            </div>
                        )}

                        <div className={`
                            max-w-[80%] rounded-2xl p-5 text-sm leading-relaxed shadow-xl
                            ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-white/5 border border-white/5 text-white rounded-tl-sm backdrop-blur-sm'
                            }
                        `}>
                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-a:text-primary prose-strong:text-white">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed opacity-90">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1 opacity-90">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1 opacity-90">{children}</ol>,
                                        h1: ({ children }) => <h1 className="text-lg font-black mb-2 uppercase tracking-tight">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-black mb-2 uppercase tracking-tight">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-black mb-1 uppercase tracking-tight">{children}</h3>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            {
                                msg.role === 'user' && (
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-1 shadow-lg relative border-2 border-white/10">
                                        {user?.user_metadata?.avatar_url && !avatarError ? (
                                            <Image
                                                src={user.user_metadata.avatar_url}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                                onError={() => setAvatarError(true)}
                                            />
                                        ) : (
                                            <Image
                                                src={getDefaultAvatar(user?.user_metadata?.full_name)}
                                                alt="Default Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                )
                            }
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                            <Bot className="w-5.5 h-5.5 text-primary" />
                        </div>
                        <div className="bg-white/5 border border-white/5 text-white rounded-2xl rounded-tl-sm p-5 flex items-center gap-3 shadow-xl backdrop-blur-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm font-bold text-white/50 animate-pulse tracking-widest uppercase text-[10px]">Consulting Guidelines...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-4 relative max-w-5xl mx-auto items-center">
                    <div className="relative flex-1 group">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question about these guidelines..."
                            className="w-full bg-white/5 border border-white/10 group-hover:border-white/20 focus:border-primary/50 rounded-2xl px-6 py-4 text-white placeholder:text-muted-foreground/40 focus:outline-none transition-all shadow-inner"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 flex items-center justify-center group"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <p className="text-[9px] text-muted-foreground/40 uppercase font-black tracking-[0.2em]">
                        Labeltune AI Advisor • Powered by GPT-4o-mini
                    </p>
                </div>
            </div>
        </div>
    );
}
