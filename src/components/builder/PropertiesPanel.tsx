import React from 'react';
import { TaskComponent } from './types';

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
                component.type === 'MultiMessage') && (
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
            {(component.type === 'Choices' || component.type === 'Labels' || component.type === 'RectangleLabels' || component.type === 'TextArea') && (
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

            {(component.type === 'Choices' || component.type === 'Checklist') && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-muted-foreground">Items (Label:Value per line)</label>
                    <textarea
                        value={component.options?.map(o => `${o.label}:${o.value}`).join('\n') || ''}
                        onChange={(e) => {
                            const lines = e.target.value.split('\n');
                            const options = lines.map(line => {
                                const [label, value] = line.split(':');
                                return { label: label?.trim(), value: (value || label)?.trim() };
                            });
                            onChange({ options });
                        }}
                        rows={5}
                        placeholder="Option 1:opt1"
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
                    />
                </div>
            )}

            {(component.type === 'Labels' || component.type === 'RectangleLabels') && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-muted-foreground">Labels (Value:Color per line)</label>
                    <textarea
                        value={component.labels?.map(l => `${l.value}:${l.background || '#000000'}`).join('\n') || ''}
                        onChange={(e) => {
                            const lines = e.target.value.split('\n');
                            const labels = lines.map(line => {
                                const [value, color] = line.split(':');
                                return { value: value?.trim(), background: (color || '#000000')?.trim() };
                            });
                            onChange({ labels });
                        }}
                        rows={5}
                        placeholder="Car:#ff0000"
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
                    />
                </div>
            )}
        </div>
    );
}
