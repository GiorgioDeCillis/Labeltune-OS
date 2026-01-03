import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, List, CheckSquare, AlignLeft, Star, Code } from 'lucide-react';
import { ComponentType } from './TaskBuilder';

function DraggableTool({ type, label, icon: Icon }: { type: ComponentType, label: string, icon: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type: 'toolbox-item',
            componentType: type,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all bg-background/50"
        >
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

export function Toolbox() {
    return (
        <div className="flex flex-col gap-2">
            <DraggableTool type="text_input" label="Short Text" icon={Type} />
            <DraggableTool type="textarea" label="Long Text" icon={AlignLeft} />
            <DraggableTool type="single_select" label="Single Select" icon={List} />
            <DraggableTool type="multi_select" label="Multi Select" icon={CheckSquare} />
            <DraggableTool type="rating" label="Rating Scale" icon={Star} />
            <DraggableTool type="markdown_display" label="Instruction / Markdown" icon={Code} />
        </div>
    );
}
