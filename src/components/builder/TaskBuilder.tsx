'use client';

import React, { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Toolbox } from './Toolbox';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { createClient } from '@/utils/supabase/client';
import { ProjectTemplate, PROJECT_TEMPLATES } from '@/utils/templates';
import { LayoutGrid, Save, Eye } from 'lucide-react';
import { TaskPreviewModal } from './TaskPreviewModal';

import { nanoid } from 'nanoid';
import { TaskComponent, TaskComponentType } from './types';

// Helper to create default component state
function createDefaultComponent(type: TaskComponentType): TaskComponent {
    const id = nanoid();
    const base: TaskComponent = {
        id,
        type,
        name: `${type.toLowerCase()}_${id.substring(0, 4)}`,
        required: false,
    };

    switch (type) {
        case 'Image':
            return { ...base, value: '$image', title: 'Image' };
        case 'Text':
            return { ...base, value: '$text', title: 'Text' };
        case 'Audio':
            return { ...base, value: '$audio', title: 'Audio' };
        case 'Header':
            return { ...base, text: 'Header Text', title: 'Header' };
        case 'View':
            return { ...base, title: 'View Container' };
        case 'Choices':
            return {
                ...base,
                title: 'Select one',
                toName: [],
                options: [
                    { label: 'Option 1', value: 'opt1' },
                    { label: 'Option 2', value: 'opt2' }
                ]
            };
        case 'Labels':
            return {
                ...base,
                title: 'Labels',
                toName: [],
                labels: [
                    { value: 'Label A', background: '#FFAABB' },
                    { value: 'Label B', background: '#AAFFBB' }
                ]
            };
        case 'TextArea':
            return { ...base, title: 'Comment', placeholder: 'Enter text here...' };
        case 'Rating':
            return { ...base, title: 'Rate this' };
        case 'Video':
            return { ...base, value: '$video', title: 'Video' };
        case 'TimeSeries':
            return { ...base, value: '$timeseries', title: 'Time Series' };
        case 'PDF':
            return { ...base, value: '$pdf', title: 'PDF Document' };
        case 'MultiMessage':
            return { ...base, value: '$messages', title: 'Chat / Conversation' };
        case 'AIResponseGenerator':
            return {
                ...base,
                title: 'AI Assistant',
                aiConfig: {
                    referenceTextLimit: 500,
                    generators: [
                        {
                            id: nanoid(),
                            name: 'Assistant 1',
                            provider: 'platform',
                        }
                    ]
                }
            };
        case 'BrushLabels':
        case 'KeypointLabels':
        case 'EllipseLabels':
        case 'RelationLabels':
            return {
                ...base,
                title: type.replace('Labels', ' Tools'),
                toName: [],
                labels: [
                    { value: 'Object A', background: '#3b82f6' },
                    { value: 'Object B', background: '#ef4444' }
                ],
                value: '$image'
            };
        case 'VideoTimeline':
            return {
                ...base,
                title: 'Video Segments',
                value: '$video',
                labels: [
                    { value: 'Action', background: '#3b82f6' },
                    { value: 'Background', background: '#10b981' }
                ]
            };
        case 'AudioSpectrogram':
            return {
                ...base,
                title: 'Audio Annotations',
                value: '$audio',
                labels: [
                    { value: 'Speech', background: '#3b82f6' },
                    { value: 'Noise', background: '#ef4444' }
                ]
            };
        case 'ThreeDBoxLabels':
            return {
                ...base,
                title: '3D Bounding Boxes',
                description: 'Annotate objects in 3D space with bounding boxes',
                labels: [
                    { value: 'Car', background: '#FF0000' },
                    { value: 'Pedestrian', background: '#00FF00' },
                    { value: 'Cyclist', background: '#0000FF' }
                ],
                value: '$lidar' // Default assumption: binds to lidar data
            };
        case 'Lidar':
            return {
                ...base,
                title: 'Lidar Point Cloud',
                value: '$lidar',
                description: 'Render large-scale point clouds (.pcd, .las) with interactive camera controls.'
            };
        case 'Mesh':
            return {
                ...base,
                title: '3D Mesh',
                value: '$mesh',
                description: 'Interactive viewport for 3D meshes (OBJ, GLTF).'
            };
        case 'Map':
            return {
                ...base,
                title: 'Map / Satellite',
                value: { center: [51.505, -0.09], zoom: 13 },
                description: 'Integrated interactive map with support for satellite imagery layers.'
            };
        case 'GeoJSONLabels':
            return {
                ...base,
                title: 'Vector Annotations',
                value: { type: "FeatureCollection", features: [] },
                description: 'Draw vector data (points, lines, polygons) directly on real-world coordinates.'
            };
        case 'DICOM':
            return {
                ...base,
                title: 'Medical Scans (DICOM)',
                value: '$dicom_url',
                description: 'Industry standard viewer for MRI, CT, and X-ray scans.'
            };
        case 'SignalPlotter':
            return {
                ...base,
                title: 'Bio-Signal Monitor',
                value: '$ecg_data',
                description: 'High-performance chart for ECG, EEG, and other high-frequency signals.'
            };
        case 'SideBySideRanking':
            return {
                ...base,
                title: 'RLHF Comparison',
                value: { model_a: '$response_a', model_b: '$response_b' },
                description: 'Compare two model outputs for Reinforcement Learning from Human Feedback.'
            };
        case 'HallucinationHighlighter':
            return {
                ...base,
                title: 'Factuality Check',
                value: '$text_content',
                description: 'Highlight and annotate factual errors or hallucinations in text.'
            };
        case 'OCRFormExtractor':
            return {
                ...base,
                title: 'Form Extraction',
                value: '$document_url',
                description: 'Extract and label structured fields (invoices, forms) from images/PDFs.'
            };
        default:
            return base;
    }
}
export function TaskBuilder({
    project,
    initialComponents,
    onComponentsChange,
    showSaveButton = true
}: {
    project?: any;
    initialComponents?: TaskComponent[];
    onComponentsChange?: (components: TaskComponent[]) => void;
    showSaveButton?: boolean;
}) {
    // Cast existing template to new type or default to empty
    const [components, setComponents] = useState<TaskComponent[]>(
        initialComponents || project?.template_schema || []
    );
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleComponentsChange = (newComponents: TaskComponent[]) => {
        setComponents(newComponents);
        onComponentsChange?.(newComponents);
    };

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
            const type = active.data.current.componentType as TaskComponentType;
            const newComponent = createDefaultComponent(type);

            handleComponentsChange([...components, newComponent]);
            setSelectedId(newComponent.id);
        }
        // Reordering in Canvas
        else if (active.id !== over.id) {
            const oldIndex = components.findIndex((item) => item.id === active.id);
            const newIndex = components.findIndex((item) => item.id === over.id);
            handleComponentsChange(arrayMove(components, oldIndex, newIndex));
        }

        setActiveId(null);
    };

    const updateComponent = (id: string, updates: Partial<TaskComponent>) => {
        handleComponentsChange(components.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeComponent = (id: string) => {
        handleComponentsChange(components.filter(item => item.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const applyTemplate = (template: ProjectTemplate) => {
        // We use fresh nanoids for the applied template components to avoid collisions
        const newComponents = template.schema.map(c => ({
            ...c,
            id: nanoid(),
            // If it's a relative link (like toName: ["image_1"]), we might need to handle it
            // but for now let's assume simple templates or unique names
        }));
        handleComponentsChange(newComponents);
        setShowTemplates(false);
    };

    const saveTemplate = async () => {
        if (!project) return;
        setIsSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('projects')
            .update({ template_schema: components })
            .eq('id', project.id);

        setIsSaving(false);
        if (error) {
            alert('Failed to save template');
        }
    };

    const selectedComponent = components.find(c => c.id === selectedId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full">
                {/* Left: Toolbox */}
                <div className="w-64 glass-panel p-4 rounded-xl flex flex-col gap-4 max-h-full overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase">Toolbox</h3>
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary"
                            title="Choose Template"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {showTemplates ? (
                        <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-2">Templates</h4>
                            {PROJECT_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => applyTemplate(t)}
                                    className="text-left p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all bg-background/50 group"
                                >
                                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{t.name}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="mt-2 text-xs text-center text-muted-foreground hover:text-foreground underline"
                            >
                                Back to Toolbox
                            </button>
                        </div>
                    ) : (
                        <Toolbox />
                    )}
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 glass-panel p-8 rounded-xl min-h-[600px] flex flex-col max-h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase">Canvas</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all font-bold text-sm"
                                title="Preview Task"
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                            {showSaveButton && project && (
                                <button
                                    onClick={saveTemplate}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-bold text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Template'}
                                </button>
                            )}
                        </div>
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
                <div className="w-80 glass-panel p-4 rounded-xl max-h-full overflow-y-auto">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase mb-4">Properties</h3>
                    {selectedComponent ? (
                        <PropertiesPanel component={selectedComponent} onChange={(updates) => updateComponent(selectedComponent.id, updates as any)} />
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
            <TaskPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                schema={components}
                project={project}
            />
        </DndContext>
    );
}
