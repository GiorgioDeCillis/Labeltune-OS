import React from 'react';
import { FormComponent } from './TaskBuilder';

export function PropertiesPanel({ component, onChange }: {
    component: FormComponent,
    onChange: (updates: Partial<FormComponent>) => void
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Label</label>
                <input
                    value={component.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
            </div>

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

            {(component.type === 'single_select' || component.type === 'multi_select') && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-muted-foreground">Options (one per line)</label>
                    <textarea
                        value={component.options?.join('\n') || ''}
                        onChange={(e) => onChange({ options: e.target.value.split('\n') })}
                        rows={5}
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
            )}
        </div>
    );
}
