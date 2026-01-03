import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormComponent } from './TaskBuilder';
import { Trash2 } from 'lucide-react';

export function Canvas({ components, selectedId, onSelect, onDelete }: {
    components: FormComponent[],
    selectedId: string | null,
    onSelect: (id: string) => void,
    onDelete: (id: string) => void
}) {
    if (components.length === 0) {
        return (
            <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-muted-foreground">
                Drag components here to build your template
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
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
    component: FormComponent,
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
                <label className="text-sm font-bold block mb-2">
                    {component.label} {component.required && <span className="text-red-400">*</span>}
                </label>

                {component.type === 'text_input' && (
                    <div className="h-10 w-full bg-white/5 rounded-lg border border-white/10" />
                )}
                {component.type === 'textarea' && (
                    <div className="h-24 w-full bg-white/5 rounded-lg border border-white/10" />
                )}
                {(component.type === 'single_select' || component.type === 'multi_select') && (
                    <div className="space-y-2">
                        {component.options?.slice(0, 3).map((opt, i) => (
                            <div key={i} className="h-8 bg-white/5 rounded-lg w-3/4" />
                        ))}
                    </div>
                )}
                {component.type === 'rating' && (
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => <div key={n} className="w-8 h-8 rounded-full bg-white/10" />)}
                    </div>
                )}
                {component.type === 'markdown_display' && (
                    <div className="prose prose-invert prose-sm">
                        <p>Markdown Content...</p>
                    </div>
                )}
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
