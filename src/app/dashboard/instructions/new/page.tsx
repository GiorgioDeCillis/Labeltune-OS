'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectInstructionsEditor, InstructionSection } from '@/components/dashboard/ProjectInstructionsEditor';
import { createInstructionSet } from '../actions';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function NewInstructionPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sections, setSections] = useState<InstructionSection[]>([
        { id: '1', title: 'General Guidelines', content: '' }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Please enter a name for the instruction set.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await createInstructionSet({
                name,
                description,
                content: sections
            });
            showToast('Instruction set created successfully!', 'success');
            router.push('/dashboard/instructions');
        } catch (error) {
            console.error('Failed to create instruction set:', error);
            showToast('Failed to create instruction set.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/instructions" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Create Instruction Set</h1>
                        <p className="text-white/60 text-sm">Define a new reusable template for your labeling tasks.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Creating...' : 'CREATE SET'}
                </button>
            </div>

            {/* Meta Info */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Standard Text Classification Guidelines"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Description (Optional)</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of what this instruction set covers..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Editor */}
            <ProjectInstructionsEditor
                sections={sections}
                onChange={setSections}
            />
        </div>
    );
}
