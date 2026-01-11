import React from 'react';
import { TaskComponent, AIGeneratorConfig } from './types';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { nanoid } from 'nanoid';

export function PropertiesPanel({ component, onChange }: {
    component: TaskComponent,
    onChange: (updates: Partial<TaskComponent>) => void
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Title / Label</label>
                <input
                    value={component.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Name (Internal ID)</label>
                <input
                    value={component.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono text-xs"
                />
            </div>

            {/* Object Binding */}
            {(component.type === 'Image' || component.type === 'Text' || component.type === 'Audio' ||
                component.type === 'Video' || component.type === 'TimeSeries' || component.type === 'PDF' ||
                component.type === 'MultiMessage' || component.type === 'VideoTimeline' || component.type === 'AudioSpectrogram') && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Value (Data Key)</label>
                        <input
                            value={component.value || ''}
                            onChange={(e) => onChange({ value: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono text-xs"
                            placeholder="$data_key"
                        />
                        <p className="text-[10px] text-muted-foreground">Key in your data JSON, e.g. $image</p>
                    </div>
                )}

            {/* Control Binding */}
            {(component.type === 'Choices' || component.type === 'Labels' ||
                component.type === 'RectangleLabels' || component.type === 'PolygonLabels' ||
                component.type === 'BrushLabels' || component.type === 'KeypointLabels' ||
                component.type === 'EllipseLabels' || component.type === 'RelationLabels' ||
                component.type === 'VideoTimeline' || component.type === 'AudioSpectrogram' ||
                component.type === 'TextArea') && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">To Name (Target)</label>
                        <input
                            value={component.toName?.[0] || ''}
                            onChange={(e) => onChange({ toName: [e.target.value] })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono text-xs"
                            placeholder="Target component name"
                        />
                        <p className="text-[10px] text-muted-foreground">Which component does this control label?</p>
                    </div>
                )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Description</label>
                <textarea
                    value={component.description || ''}
                    onChange={(e) => onChange({ description: e.target.value })}
                    rows={3}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={component.required}
                    onChange={(e) => onChange({ required: e.target.checked })}
                    className="rounded bg-background/50 border-white/10 accent-primary"
                />
                <span className="text-sm">Required field</span>
            </label>

            {(component.type === 'Choices' || component.type === 'Checklist' || component.type === 'AccordionChoices' || component.type === 'Rating') && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                    {component.type === 'AccordionChoices' && (
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={component.multiple || false}
                                onChange={(e) => onChange({ multiple: e.target.checked })}
                                className="w-4 h-4 rounded border-white/10 bg-background/50 accent-primary"
                            />
                            <span className="text-sm">Allow Multiple Selection</span>
                        </label>
                    )}

                    {component.type === 'AccordionChoices' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">
                                Smart Paste <span className="font-normal text-primary/70">(▼ for headers)</span>
                            </label>
                            <textarea
                                placeholder="▼ Category Name\nOption 1 (e.g., description)\nOption 2"
                                className="w-full bg-background/50 border border-dashed border-primary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono min-h-[80px]"
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData('text');
                                    const lines = text.split('\n').filter(l => l.trim());
                                    const options = lines.map(line => {
                                        const trimmed = line.trim();
                                        if (trimmed.startsWith('▼')) {
                                            const header = trimmed.replace('▼', '').trim();
                                            return { label: `# ${header}`, value: header.toLowerCase().replace(/\s+/g, '_') };
                                        } else {
                                            // Keep full label, but generate clean value from text before parentheses
                                            const match = trimmed.match(/^(.+?)\s*\(/);
                                            const valueBase = match ? match[1].trim() : trimmed;
                                            const value = valueBase.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
                                            return { label: trimmed, value };
                                        }
                                    });
                                    onChange({ options });
                                    (e.target as HTMLTextAreaElement).value = '';
                                }}
                            />
                            <p className="text-[10px] text-muted-foreground/60">Paste formatted text here to auto-populate Items below</p>
                        </div>
                    )}

                    {(component.type === 'Choices' || component.type === 'Checklist' || component.type === 'Rating') && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">
                                Smart Paste <span className="font-normal text-primary/70">(one option per line)</span>
                            </label>
                            <textarea
                                placeholder="Option 1\nOption 2\nOption 3"
                                className="w-full bg-background/50 border border-dashed border-primary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono min-h-[60px]"
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData('text');
                                    const lines = text.split('\n').filter(l => l.trim());
                                    const options = lines.map(line => {
                                        const trimmed = line.trim();
                                        // Keep full label, generate clean value
                                        const match = trimmed.match(/^(.+?)\s*\(/);
                                        const valueBase = match ? match[1].trim() : trimmed;
                                        const value = valueBase.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
                                        return { label: trimmed, value };
                                    });
                                    onChange({ options });
                                    (e.target as HTMLTextAreaElement).value = '';
                                }}
                            />
                            <p className="text-[10px] text-muted-foreground/60">Paste a list of options to auto-populate Items below</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground flex justify-between">
                            <span>Items (Label:Value per line)</span>
                            {component.type === 'AccordionChoices' && (
                                <span className="text-primary italic">Use # Name for headers</span>
                            )}
                        </label>
                        <ListEditor
                            value={component.options?.map(o => `${o.label}:${o.value}`).join('\n') || ''}
                            onChange={(text: string) => {
                                const lines = text.split('\n');
                                const options = lines.map(line => {
                                    const [label, value] = line.split(':');
                                    // Handle empty lines or potential parsing issues gracefully
                                    if (!line.trim()) return null;
                                    return { label: label?.trim(), value: (value || label)?.trim() };
                                }).filter(Boolean) as any[];
                                onChange({ options });
                            }}
                            rows={5}
                            placeholder="Option 1:opt1"
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
                        />
                    </div>
                </div>
            )}

            {(component.type === 'Labels' ||
                component.type === 'RectangleLabels' || component.type === 'PolygonLabels' ||
                component.type === 'BrushLabels' || component.type === 'KeypointLabels' ||
                component.type === 'EllipseLabels' || component.type === 'RelationLabels' ||
                component.type === 'VideoTimeline' || component.type === 'AudioSpectrogram'
            ) && (
                    <div className="space-y-2 pt-4 border-t border-white/5">
                        <label className="text-xs font-bold text-muted-foreground">Labels (Value:Color per line)</label>
                        <ListEditor
                            value={component.labels?.map(l => `${l.value}:${l.background || '#000000'}`).join('\n') || ''}
                            onChange={(text: string) => {
                                const lines = text.split('\n');
                                const labels = lines.map(line => {
                                    const [value, color] = line.split(':');
                                    if (!line.trim()) return null;
                                    return { value: value?.trim(), background: (color || '#000000')?.trim() };
                                }).filter(Boolean) as any[];
                                onChange({ labels });
                            }}
                            rows={5}
                            placeholder="Car:#ff0000"
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
                        />
                    </div>
                )}

            {/* Vision Config */}
            {(component.type === 'RectangleLabels' || component.type === 'PolygonLabels' ||
                component.type === 'BrushLabels' || component.type === 'KeypointLabels' ||
                component.type === 'EllipseLabels' || component.type === 'RelationLabels'
            ) && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            Vision Settings
                        </h4>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={component.imageConfig?.canZoom ?? true}
                                    onChange={(e) => onChange({ imageConfig: { labels: [], ...component.imageConfig, canZoom: e.target.checked } })}
                                    className="rounded bg-background/50 border-white/10 accent-primary"
                                />
                                <span className="text-sm">Allow Zoom & Pan</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={component.imageConfig?.canBrightnessContrast ?? false}
                                    onChange={(e) => onChange({ imageConfig: { labels: [], ...component.imageConfig, canBrightnessContrast: e.target.checked } })}
                                    className="rounded bg-background/50 border-white/10 accent-primary"
                                />
                                <span className="text-sm">Allow Brightness/Contrast</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={component.imageConfig?.canRotate ?? false}
                                    onChange={(e) => onChange({ imageConfig: { labels: [], ...component.imageConfig, canRotate: e.target.checked } })}
                                    className="rounded bg-background/50 border-white/10 accent-primary"
                                />
                                <span className="text-sm">Allow Rotation</span>
                            </label>
                        </div>
                    </div>
                )}

            {/* NLP Config */}
            {(component.type === 'Labels') && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-muted-foreground">Labeling Mode</h4>
                    <select
                        value={component.granularity || 'image'}
                        onChange={(e) => onChange({ granularity: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    >
                        <option value="image">Whole Object (Classification)</option>
                        <option value="symbol">Span / Region (NER)</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground">Select 'Span / Region' for text highlighting (NER).</p>
                </div>
            )}

            {component.type === 'AIResponseGenerator' && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <Wand2 className="w-3 h-3" />
                        AI Configuration
                    </h4>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Reference Text Limit</label>
                        <input
                            type="number"
                            value={component.aiConfig?.referenceTextLimit || 500}
                            onChange={(e) => onChange({
                                aiConfig: {
                                    ...component.aiConfig,
                                    referenceTextLimit: parseInt(e.target.value) || 0
                                }
                            })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground flex justify-between items-center">
                            <span>Generators</span>
                            <button
                                onClick={() => {
                                    const newGen: AIGeneratorConfig = {
                                        id: nanoid(),
                                        name: `Assistant ${(component.aiConfig?.generators?.length || 0) + 1}`,
                                        provider: 'platform'
                                    };
                                    onChange({
                                        aiConfig: {
                                            ...component.aiConfig,
                                            generators: [...(component.aiConfig?.generators || []), newGen]
                                        }
                                    });
                                }}
                                className="text-[10px] bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                Add
                            </button>
                        </label>

                        <div className="space-y-3">
                            {component.aiConfig?.generators?.map((gen, index) => (
                                <div key={gen.id} className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-3 relative group">
                                    <button
                                        onClick={() => {
                                            const newGens = component.aiConfig?.generators?.filter(g => g.id !== gen.id);
                                            onChange({
                                                aiConfig: { ...component.aiConfig, generators: newGens }
                                            });
                                        }}
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground">Name</label>
                                        <input
                                            value={gen.name}
                                            onChange={(e) => {
                                                const newGens = [...(component.aiConfig?.generators || [])];
                                                newGens[index] = { ...gen, name: e.target.value };
                                                onChange({ aiConfig: { ...component.aiConfig, generators: newGens } });
                                            }}
                                            className="w-full bg-background/50 border border-white/10 rounded px-2 py-1 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground">Provider</label>
                                        <select
                                            value={gen.provider}
                                            onChange={(e) => {
                                                const newGens = [...(component.aiConfig?.generators || [])];
                                                newGens[index] = { ...gen, provider: e.target.value as any };
                                                onChange({ aiConfig: { ...component.aiConfig, generators: newGens } });
                                            }}
                                            className="w-full bg-background/50 border border-white/10 rounded px-2 py-1 text-xs"
                                        >
                                            <option value="platform">Platform Default</option>
                                            <option value="openai">OpenAI (User Key)</option>
                                            <option value="anthropic">Anthropic (User Key)</option>
                                        </select>
                                    </div>

                                    {gen.provider !== 'platform' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted-foreground">API Key</label>
                                            <input
                                                type="password"
                                                value={gen.apiKey || ''}
                                                onChange={(e) => {
                                                    const newGens = [...(component.aiConfig?.generators || [])];
                                                    newGens[index] = { ...gen, apiKey: e.target.value };
                                                    onChange({ aiConfig: { ...component.aiConfig, generators: newGens } });
                                                }}
                                                placeholder="sk-..."
                                                className="w-full bg-background/50 border border-white/10 rounded px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    )}

                                    {gen.provider !== 'platform' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted-foreground">Model Name</label>
                                            <input
                                                value={gen.model || ''}
                                                onChange={(e) => {
                                                    const newGens = [...(component.aiConfig?.generators || [])];
                                                    newGens[index] = { ...gen, model: e.target.value };
                                                    onChange({ aiConfig: { ...component.aiConfig, generators: newGens } });
                                                }}
                                                placeholder={gen.provider === 'openai' ? 'gpt-4' : 'claude-3-opus-20240229'}
                                                className="w-full bg-background/50 border border-white/10 rounded px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground">System Prompt</label>
                                        <textarea
                                            value={gen.systemPrompt || ''}
                                            onChange={(e) => {
                                                const newGens = [...(component.aiConfig?.generators || [])];
                                                newGens[index] = { ...gen, systemPrompt: e.target.value };
                                                onChange({ aiConfig: { ...component.aiConfig, generators: newGens } });
                                            }}
                                            rows={2}
                                            className="w-full bg-background/50 border border-white/10 rounded px-2 py-1 text-xs resize-none"
                                        />
                                    </div>
                                </div>
                            ))}

                            {(!component.aiConfig?.generators?.length) && (
                                <div className="text-center p-4 border border-dashed border-white/10 rounded-lg text-xs text-muted-foreground">
                                    No generators configured.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ListEditor({ value, onChange, placeholder, className, rows }: any) {
    const [text, setText] = React.useState(value);

    // Sync with external changes, but only if they are significantly different to avoid fighting the user
    // Ideally we trust the user's focus state, but for simple implementation:
    React.useEffect(() => {
        setText(value);
    }, [value]);

    return (
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onChange(text)}
            className={className}
            rows={rows}
            placeholder={placeholder}
        />
    );
}
