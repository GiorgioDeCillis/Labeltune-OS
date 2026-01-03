'use client';

import React, { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Toolbox } from './Toolbox';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { createClient } from '@/utils/supabase/client';
import { Save } from 'lucide-react';
import { nanoid } from 'nanoid';

export type ComponentType = 'text_input' | 'textarea' | 'single_select' | 'multi_select' | 'rating' | 'markdown_display';

export interface FormComponent {
    id: string;
    type: ComponentType;
    label: string;
    required?: boolean;
    options?: string[]; // For select components
    description?: string;
    placeholder?: string;
}

export function TaskBuilder({ project }: { project: any }) {
    const [components, setComponents] = useState<FormComponent[]>(project.template_schema || []);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        // Dropping from Toolbox
        if (active.data.current?.type === 'toolbox-item') {
            const type = active.data.current.componentType as ComponentType;
            const newComponent: FormComponent = {
                id: nanoid(),
                type,
                label: `New ${type.replace('_', ' ')}`,
                required: false,
                options: type.includes('select') ? ['Option 1', 'Option 2'] : undefined
            };
            setComponents((items) => [...items, newComponent]);
            setSelectedId(newComponent.id);
        }
        // Reordering in Canvas
        else if (active.id !== over.id) {
            setComponents((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const updateComponent = (id: string, updates: Partial<FormComponent>) => {
        setComponents(items => items.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeComponent = (id: string) => {
        setComponents(items => items.filter(item => item.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const saveTemplate = async () => {
        setIsSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('projects')
            .update({ template_schema: components })
            .eq('id', project.id);

        setIsSaving(false);
        if (error) {
            alert('Failed to save template');
        } else {
            // Maybe show toast
        }
    };

    const selectedComponent = components.find(c => c.id === selectedId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full items-start">
                {/* Left: Toolbox */}
                <div className="w-64 glass-panel p-4 rounded-xl flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase">Toolbox</h3>
                    <Toolbox />
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 glass-panel p-8 rounded-xl min-h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase">Canvas</h3>
                        <button
                            onClick={saveTemplate}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-bold"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>

                    <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <Canvas
                            components={components}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onDelete={removeComponent}
                        />
                    </SortableContext>
                </div>

                {/* Right: Properties */}
                <div className="w-80 glass-panel p-4 rounded-xl">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase mb-4">Properties</h3>
                    {selectedComponent ? (
                        <PropertiesPanel component={selectedComponent} onChange={(updates) => updateComponent(selectedComponent.id, updates)} />
                    ) : (
                        <div className="text-muted-foreground text-sm text-center py-10">
                            Select a component to edit properties.
                        </div>
                    )}
                </div>
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="p-4 bg-primary/20 backdrop-blur-md rounded-lg border border-primary/50 text-foreground w-48 shadow-lg">
                        Dragging...
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
