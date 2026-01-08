'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, ChevronRight, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InstructionSection } from '@/types/manual-types';

interface GuidelinesViewerProps {
    guidelines: InstructionSection[] | string;
    isOpen: boolean;
    onClose: () => void;
}

export function GuidelinesViewer({ guidelines, isOpen, onClose }: GuidelinesViewerProps) {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const Highlight = ({ children, query }: { children: React.ReactNode; query: string }) => {
        if (!query) return <>{children}</>;

        const highlightText = (text: string) => {
            if (!text) return text;
            const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
            return parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ?
                    <mark key={i} className="bg-primary/30 text-primary font-medium rounded-sm px-0.5">{part}</mark> :
                    part
            );
        };

        const traverse = (node: React.ReactNode): React.ReactNode => {
            if (typeof node === 'string') {
                return highlightText(node);
            }
            if (Array.isArray(node)) {
                return node.map((child, i) => <React.Fragment key={i}>{traverse(child)}</React.Fragment>);
            }
            if (React.isValidElement(node)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { children, ...props } = node.props as any;
                return React.cloneElement(node, props, traverse(children));
            }
            return node;
        };

        return <>{traverse(children)}</>;
    };

    if (!isOpen || !mounted) return null;

    let sections: InstructionSection[] = [];
    if (typeof guidelines === 'string') {
        try {
            const parsed = JSON.parse(guidelines);
            if (Array.isArray(parsed)) {
                sections = parsed;
            } else {
                sections = [{ id: '1', title: 'General Guidelines', content: guidelines }];
            }
        } catch (e) {
            sections = [{ id: '1', title: 'General Guidelines', content: guidelines }];
        }
    } else if (Array.isArray(guidelines)) {
        sections = guidelines;
    }

    const filteredSections = sections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeSectionId === null && filteredSections.length > 0) {
        setActiveSectionId(filteredSections[0].id);
    }

    const activeSection = sections.find(s => s.id === activeSectionId);

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = sections.map(s => `
            <div class="section">
                <h1>${s.title}</h1>
                <div class="content">${s.content}</div>
            </div>
        `).join('<hr/>');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Project Instructions</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        h1 { color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        .section { margin-bottom: 40px; page-break-after: always; }
                        .section:last-child { page-break-after: auto; }
                        hr { margin: 40px 0; border: none; border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Project Guidelines</h2>
                            <p className="text-xs text-muted-foreground">Read the instructions carefully to ensure high-quality labeling.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 border-r border-white/5 bg-white/2 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <input
                                    type="text"
                                    placeholder="Search in instructions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {filteredSections.length > 0 ? (
                                filteredSections.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSectionId(s.id)}
                                        className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between group ${activeSectionId === s.id
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="truncate">{s.title}</span>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${activeSectionId === s.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))
                            ) : (
                                <div className="py-10 text-center text-muted-foreground text-sm">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Viewer */}
                    <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-primary max-w-none bg-black/20">
                        {activeSection ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h1 className="text-3xl font-black mb-8 border-b border-white/10 pb-6">
                                    <Highlight query={searchQuery}>{activeSection.title}</Highlight>
                                </h1>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => <p className="mb-4 last:mb-0"><Highlight query={searchQuery}>{children}</Highlight></p>,
                                        li: ({ children }) => <li><Highlight query={searchQuery}>{children}</Highlight></li>,
                                        h1: ({ children }) => <h1><Highlight query={searchQuery}>{children}</Highlight></h1>,
                                        h2: ({ children }) => <h2><Highlight query={searchQuery}>{children}</Highlight></h2>,
                                        h3: ({ children }) => <h3><Highlight query={searchQuery}>{children}</Highlight></h3>,
                                        h4: ({ children }) => <h4><Highlight query={searchQuery}>{children}</Highlight></h4>,
                                        h5: ({ children }) => <h5><Highlight query={searchQuery}>{children}</Highlight></h5>,
                                        h6: ({ children }) => <h6><Highlight query={searchQuery}>{children}</Highlight></h6>,
                                        blockquote: ({ children }) => <blockquote><Highlight query={searchQuery}>{children}</Highlight></blockquote>,
                                        td: ({ children }) => <td><Highlight query={searchQuery}>{children}</Highlight></td>,
                                        th: ({ children }) => <th><Highlight query={searchQuery}>{children}</Highlight></th>,
                                    }}
                                >
                                    {activeSection.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a section to view the instructions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >,
        document.body
    );
}
