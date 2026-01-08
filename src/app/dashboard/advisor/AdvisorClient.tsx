'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Upload, Send, User, ChevronLeft, ChevronRight, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createInstructionSet } from '../instructions/actions';
import { useToast } from '@/components/Toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Use dynamic import for pdfjs to avoid server-side issues
const getPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    // Set worker source
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    return pdfjs;
};

interface InstructionSet {
    id: string;
    name: string;
    content: any;
    is_uploaded?: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AdvisorClient({ instructions }: { instructions: InstructionSet[] }) {
    const router = useRouter();
    const { showToast } = useToast();

    // State
    const [selectedInstruction, setSelectedInstruction] = useState<InstructionSet | null>(null);
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

            // Auto-select the new instruction (we assume refresh puts it in the list, but for immediate UX we might need it from return)
            if (newInst) {
                // We need to wait for parent refresh, or just set it locally if compatible
                // Since this is a client component receiving props, strict sync requires refresh.
                // However, createInstructionSet returns the object.
                // We can optimistically select it, but 'content' type might mismatch if not careful.
                const castInst = newInst as InstructionSet;
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
                    messages: [...messages, userMsg], // Send history + new message
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
                    <h1 className="text-3xl font-black tracking-tight text-white">AI Instruction Advisor</h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Select an instruction set to start chatting using our advanced AI.
                        You can ask questions, clarify guidelines, or resolve ambiguities.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="glass-panel p-6 rounded-2xl border border-dashed border-white/20 hover:bg-white/5 hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center gap-4 min-h-[240px]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Uploading...</h3>
                                    <p className="text-sm text-muted-foreground">{uploadStatus}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Upload Watermarked Instructions</h3>
                                    <p className="text-sm text-muted-foreground">PDF format supported • AI parsing enabled</p>
                                </div>
                            </>
                        )}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />

                    {/* Existing Instructions */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-white/80 px-2">Select from Library</h3>
                        <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {instructions.map(inst => (
                                <button
                                    key={inst.id}
                                    onClick={() => {
                                        setSelectedInstruction(inst);
                                        setMessages([{ role: 'assistant', content: `Hello! I'm ready to discuss "${inst.name}". What do you need help with?` }]);
                                    }}
                                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group flex items-start gap-4"
                                >
                                    <div className="p-2 rounded-lg bg-black/20 text-muted-foreground group-hover:text-primary transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-primary transition-colors">{inst.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                            {inst.is_uploaded && <span className="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded">Uploaded</span>}
                                            <span>{(inst.content || []).length} Sections</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/20 ml-auto group-hover:text-white transition-colors self-center" />
                                </button>
                            ))}
                            {instructions.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground text-sm">
                                    No instructions found. Upload one to get started!
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
        <div className="h-[calc(100vh-120px)] flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedInstruction(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                        title="Back to selection"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            {selectedInstruction.name}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            {selectedInstruction.is_uploaded ? 'Uploaded Instruction' : 'Platform Instruction'}
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            AI Advisor Active
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedInstruction(null)}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    CHANGE INSTRUCTION
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                        )}

                        <div className={`
                            max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-white/5 border border-white/5 text-white rounded-tl-sm'
                            }
                        `}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-invert prose-sm max-w-none"
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="bg-white/5 border border-white/5 text-white rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/20 border-t border-white/10 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex gap-3 relative max-w-4xl mx-auto">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about these instructions..."
                        className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        AI can make mistakes. Check important guidelines manually.
                    </p>
                </div>
            </div>
        </div>
    );
}
