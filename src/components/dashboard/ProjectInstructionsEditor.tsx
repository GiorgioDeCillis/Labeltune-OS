'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, FileText, Download, Eye, Upload, Loader2, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Use dynamic import for pdfjs to avoid server-side issues
const getPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    // Set worker source
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    return pdfjs;
};

export interface InstructionSection {
    id: string;
    title: string;
    content: string;
}

interface ProjectInstructionsEditorProps {
    sections: InstructionSection[];
    onChange: (sections: InstructionSection[]) => void;
}

function SortableSectionItem({
    section,
    isActive,
    onSelect,
    onDelete,
    onUpdateTitle
}: {
    section: InstructionSection;
    isActive: boolean;
    onSelect: () => void;
    onDelete: (id: string) => void;
    onUpdateTitle: (id: string, title: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={`group p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all border ${isActive ? 'bg-primary/10 border-primary/30 text-primary' : 'hover:bg-white/5 border-transparent text-muted-foreground hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:text-white transition-colors p-1 -ml-1">
                    <GripVertical className="w-4 h-4 opacity-30" />
                </div>
                <input
                    value={section.title}
                    onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-sm font-medium bg-transparent focus:outline-none w-full ${isActive ? 'text-primary' : 'text-inherit'}`}
                    placeholder="Enter section title..."
                />
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(section.id);
                }}
                className="p-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
}

export function ProjectInstructionsEditor({ sections, onChange }: ProjectInstructionsEditorProps) {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(
        sections.length > 0 ? sections[0].id : null
    );
    const [isPreview, setIsPreview] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);

            onChange(arrayMove(sections, oldIndex, newIndex));
        }
    };

    const handleImportPDFClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            // 1. Extract text from PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdfjs = await getPdfJs();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n\n';
            }

            // 2. Send to AI for parsing
            const response = await fetch('/api/instructions/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText }),
            });

            if (!response.ok) {
                throw new Error('Failed to parse instructions');
            }

            const data = await response.json();

            // 3. Append new sections
            if (data.sections && Array.isArray(data.sections)) {
                // Determine if we should replace or append
                // If it's a fresh project (only 1 empty section), replace.
                // Otherwise append.
                const isFresh = sections.length === 0 || (sections.length === 1 && sections[0].title === 'New Section' && sections[0].content === '');

                let newSections = data.sections;
                if (!isFresh) {
                    newSections = [...sections, ...data.sections];
                }

                onChange(newSections);
                if (newSections.length > 0) {
                    setActiveSectionId(newSections[isFresh ? 0 : sections.length].id);
                }
            }

        } catch (error) {
            console.error('Import failed', error);
            alert('Failed to import PDF. Please try again.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {isImporting && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white">
                    <div className="bg-black/40 p-8 rounded-2xl border border-white/10 flex flex-col items-center animate-pulse">
                        <Wand2 className="w-12 h-12 mb-4 text-purple-400 animate-spin-slow" />
                        <h3 className="text-xl font-bold mb-2">AI is analyzing your PDF...</h3>
                        <p className="text-muted-foreground text-center max-w-xs">
                            Extracting text, removing watermarks, and structuring guidelines. This may take a moment.
                        </p>
                    </div>
                </div>
            )}

            <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-bold">Project Instructions</h3>
                    <p className="text-sm text-muted-foreground">Define multiple sections of guidelines for attempters.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleImportPDFClick}
                        disabled={isImporting}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-200 border border-purple-500/30 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group"
                    >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />}
                        Import PDF with AI
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-1"></div>
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sections.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sections.map((section) => (
                                    <SortableSectionItem
                                        key={section.id}
                                        section={section}
                                        isActive={activeSectionId === section.id}
                                        onSelect={() => setActiveSectionId(section.id)}
                                        onDelete={handleDeleteSection}
                                        onUpdateTitle={(id, title) => handleUpdateSection(id, 'title', title)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="lg:col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden">
                    {activeSection ? (
                        <div className="flex flex-col h-full">
                            {!isPreview ? (
                                <>
                                    <div className="p-4 border-b border-white/10 bg-white/5">
                                        <input
                                            value={activeSection.title}
                                            onChange={(e) => handleUpdateSection(activeSection.id, 'title', e.target.value)}
                                            placeholder="Section Title"
                                            className="w-full bg-transparent text-xl font-bold focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 p-4 bg-black/20">
                                        <textarea
                                            value={activeSection.content}
                                            onChange={(e) => handleUpdateSection(activeSection.id, 'content', e.target.value)}
                                            placeholder="Write your instructions in Markdown..."
                                            className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 prose prose-invert max-w-none overflow-y-auto h-full bg-black/40">
                                    <h1 className="text-3xl font-black mb-8 border-b border-white/10 pb-6">{activeSection.title}</h1>
                                    <ReactMarkdown>{activeSection.content || '_No content yet._'}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-white/5">
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
