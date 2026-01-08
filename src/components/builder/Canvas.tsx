import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskComponent } from './types';
import { Trash2, Image as ImageIcon, Music, AlignLeft, Type, Mic, ChevronRight, Bot } from 'lucide-react';

export function Canvas({ components, selectedId, onSelect, onDelete }: {
    components: TaskComponent[],
    selectedId: string | null,
    onSelect: (id: string) => void,
    onDelete: (id: string) => void
}) {
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable',
    });

    if (components.length === 0) {
        return (
            <div
                ref={setNodeRef}
                className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-muted-foreground"
            >
                Drag components here to build your template
            </div>
        );
    }

    return (
        <div ref={setNodeRef} className="flex-1 space-y-4 overflow-y-auto pr-2">
            {components.map((component) => (
                <SortableComponent
                    key={component.id}
                    component={component}
                    isSelected={component.id === selectedId}
                    onSelect={() => onSelect(component.id)}
                    onDelete={() => onDelete(component.id)}
                />
            ))}
        </div>
    );
}

function SortableComponent({ component, isSelected, onSelect, onDelete }: {
    component: TaskComponent,
    isSelected: boolean,
    onSelect: () => void,
    onDelete: (e: any) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onSelect}
            className={`p-4 rounded-xl border-2 cursor-default transition-all group relative ${isSelected
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-white/5 hover:border-white/10'
                }`}
        >
            <div className="pointer-events-none">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold block">
                        {(component.title || component.name)} {component.required && <span className="text-red-400">*</span>}
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">{component.type}</span>
                </div>

                {component.type === 'Image' && (
                    <div className="h-32 w-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-xs">Image Placeholder ({component.value})</span>
                    </div>
                )}

                {component.type === 'Text' && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2"><Type className="w-4 h-4" /> Text Content ({component.value})</span>
                    </div>
                )}

                {component.type === 'Audio' && (
                    <div className="h-12 w-full bg-white/5 rounded-full border border-white/10 flex items-center px-4 gap-3 text-muted-foreground">
                        <Music className="w-4 h-4" />
                        <div className="flex-1 h-1 bg-white/10 rounded-full"></div>
                        <span className="text-xs">{component.value}</span>
                    </div>
                )}

                {component.type === 'AudioRecorder' && (
                    <div className="h-20 w-full bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Mic className="w-6 h-6 opacity-50" />
                        <span className="text-xs uppercase tracking-widest font-bold">Audio Recorder Component</span>
                    </div>
                )}

                {component.type === 'Choices' && (
                    <div className="space-y-2">
                        {component.options?.slice(0, 3).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-white/20"></div>
                                <span className="text-sm">{opt.label}</span>
                            </div>
                        ))}
                        {(component.options?.length || 0) > 3 && <div className="text-xs text-muted-foreground pl-6">...more</div>}
                    </div>
                )}

                {component.type === 'Labels' && (
                    <div className="flex flex-wrap gap-2">
                        {component.labels?.map((label, i) => (
                            <span key={i}
                                className="px-2 py-1 rounded text-xs text-black font-medium"
                                style={{ backgroundColor: label.background || '#ccc' }}
                            >
                                {label.value}
                            </span>
                        ))}
                    </div>
                )}

                {component.type === 'TextArea' && (
                    <div className="h-24 w-full bg-white/5 rounded-lg border border-white/10 p-2 text-xs text-muted-foreground">
                        {component.placeholder || 'Text area input...'}
                    </div>
                )}

                {component.type === 'Rating' && (
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => <div key={n} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">{n}</div>)}
                    </div>
                )}

                {component.type === 'RectangleLabels' && (
                    <div className="h-32 w-full bg-white/5 rounded-lg border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                            Rectangle on Region
                        </div>
                        <div className="absolute top-4 left-4 w-20 h-20 border-2 border-red-500 bg-red-500/10 rounded flex items-start justify-start">
                            <span className="bg-red-500 text-white text-[10px] px-1">Label</span>
                        </div>
                    </div>
                )}

                {component.type === 'Checklist' && (
                    <div className="space-y-2">
                        {component.options?.slice(0, 3).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-50"></div>
                                </div>
                                <span className="text-sm">{opt.label}</span>
                            </div>
                        ))}
                        {(component.options?.length || 0) > 3 && <div className="text-xs text-muted-foreground pl-6">...more</div>}
                        {(!component.options || component.options.length === 0) && (
                            <div className="text-xs text-muted-foreground italic">No items added yet</div>
                        )}
                    </div>
                )}

                {component.type === 'AccordionChoices' && (
                    <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between opacity-50">
                            <span className="text-xs font-bold uppercase tracking-wider">Group Header</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="pl-4 space-y-2">
                            <div className="flex items-center gap-2 opacity-30">
                                <div className="w-4 h-4 rounded-full border border-white/20" />
                                <div className="h-2 w-24 bg-white/20 rounded" />
                            </div>
                            <div className="flex items-center gap-2 opacity-30">
                                <div className="w-4 h-4 rounded-full border border-white/20" />
                                <div className="h-2 w-32 bg-white/20 rounded" />
                            </div>
                        </div>
                    </div>
                )}

                {component.type === 'AIResponseGenerator' && (
                    <div className="space-y-2">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Bot className="w-6 h-6 opacity-50" />
                            <span className="text-xs uppercase tracking-widest font-bold">AI Assistant ({component.aiConfig?.generators?.length || 0} models)</span>
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground mt-2">{component.description}</div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e);
                }}
                className="absolute top-2 right-2 p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
