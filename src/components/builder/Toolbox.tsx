import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
    Type,
    List,
    CheckSquare,
    AlignLeft,
    Star,
    Code,
    ImageIcon,
    Music,
    MessageSquare,
    MousePointer2,
    Hash,
    Video,
    Activity,
    FileText,
    MessagesSquare,
    Mic,
    ListTree,
    Bot
} from 'lucide-react';
import { TaskComponentType } from './types';

function DraggableTool({ type, label, icon: Icon }: { type: TaskComponentType, label: string, icon: any }) {
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
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Objects</h4>
                <DraggableTool type="Image" label="Image" icon={ImageIcon} />
                <DraggableTool type="Text" label="Text" icon={Type} />
                <DraggableTool type="Audio" label="Audio" icon={Music} />
                <DraggableTool type="HyperText" label="HTML / HyperText" icon={Code} />
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Controls</h4>
                <DraggableTool type="Choices" label="Choices (Select)" icon={List} />
                <DraggableTool type="Labels" label="Labels (Tags)" icon={CheckSquare} />
                <DraggableTool type="TextArea" label="Text Area input" icon={AlignLeft} />
                <DraggableTool type="Rating" label="Rating" icon={Star} />
                <DraggableTool type="Number" label="Number" icon={Hash} />
                <DraggableTool type="RectangleLabels" label="Rectangle Labels" icon={MousePointer2} />
                <DraggableTool type="PolygonLabels" label="Polygon Labels" icon={MousePointer2} />
                <DraggableTool type="AudioRecorder" label="Audio Recorder" icon={Mic} />
                <DraggableTool type="Checklist" label="Self-Check List" icon={CheckSquare} />
                <DraggableTool type="AccordionChoices" label="Accordion Choices" icon={ListTree} />
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Layout</h4>
                <DraggableTool type="Header" label="Header" icon={Type} />
                <DraggableTool type="View" label="View / Container" icon={AlignLeft} />
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Advanced</h4>
                <DraggableTool type="Video" label="Video player" icon={Video} />
                <DraggableTool type="TimeSeries" label="Time Series Chart" icon={Activity} />
                <DraggableTool type="PDF" label="PDF Document" icon={FileText} />
                <DraggableTool type="MultiMessage" label="Conversation (LLM)" icon={MessagesSquare} />
                <DraggableTool type="AIResponseGenerator" label="AI Assistant" icon={Bot} />
            </div>
        </div>
    );
}
