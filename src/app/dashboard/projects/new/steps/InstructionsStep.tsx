'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, FileText, Download, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface InstructionSection {
    id: string;
    title: string;
    content: string;
}

interface InstructionsStepProps {
    sections: InstructionSection[];
    onChange: (sections: InstructionSection[]) => void;
}

export function InstructionsStep({ sections, onChange }: InstructionsStepProps) {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(
        sections.length > 0 ? sections[0].id : null
    );
    const [isPreview, setIsPreview] = useState(false);

    const handleAddSection = () => {
        const newSection: InstructionSection = {
            id: crypto.randomUUID(),
            title: 'New Section',
            content: '',
        };
        const updated = [...sections, newSection];
        onChange(updated);
        setActiveSectionId(newSection.id);
    };

    const handleUpdateSection = (id: string, field: keyof InstructionSection, value: string) => {
        const updated = sections.map((s) => (s.id === id ? { ...s, [field]: value } : s));
        onChange(updated);
    };

    const handleDeleteSection = (id: string) => {
        const updated = sections.filter((s) => s.id !== id);
        onChange(updated);
        if (activeSectionId === id) {
            setActiveSectionId(updated.length > 0 ? updated[0].id : null);
        }
    };

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = sections
            .map(
                (s) => `
            <div class="section">
                <h1>${s.title}</h1>
                <div class="content">${s.content}</div>
            </div>
        `
            )
            .join('<hr/>');

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
                        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
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

    const activeSection = sections.find((s) => s.id === activeSectionId);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-bold">Project Instructions</h3>
                    <p className="text-sm text-muted-foreground">Define multiple sections of guidelines for attempters.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        {isPreview ? <><FileText className="w-4 h-4" /> Edit Mode</> : <><Eye className="w-4 h-4" /> Preview Mode</>}
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={sections.length === 0}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Sidebar */}
                <div className="lg:col-span-1 glass-panel rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Sections</span>
                        <button onClick={handleAddSection} className="p-1 hover:bg-primary/20 hover:text-primary rounded transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className={`group p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${activeSectionId === section.id ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <GripVertical className="w-4 h-4 opacity-30" />
                                    <span className="text-sm font-medium truncate">{section.title}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSection(section.id);
                                    }}
                                    className="p-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Content */}
                <div className="lg:col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden">
                    {activeSection ? (
                        <div className="flex flex-col h-full">
                            {!isPreview ? (
                                <>
                                    <div className="p-4 border-b border-white/10">
                                        <input
                                            value={activeSection.title}
                                            onChange={(e) => handleUpdateSection(activeSection.id, 'title', e.target.value)}
                                            placeholder="Section Title"
                                            className="w-full bg-transparent text-xl font-bold focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 p-4">
                                        <textarea
                                            value={activeSection.content}
                                            onChange={(e) => handleUpdateSection(activeSection.id, 'content', e.target.value)}
                                            placeholder="Write your instructions in Markdown..."
                                            className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 prose prose-invert max-w-none overflow-y-auto h-full">
                                    <h1 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4">{activeSection.title}</h1>
                                    <ReactMarkdown>{activeSection.content || '_No content yet._'}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <h4 className="font-bold mb-1">No Section Selected</h4>
                            <p className="text-sm">Create or select a section from the sidebar to start writing guidelines.</p>
                            <button
                                onClick={handleAddSection}
                                className="mt-6 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add First Section
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
