'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectInstructionsEditor } from '@/components/dashboard/ProjectInstructionsEditor';
import { updateInstructionSet, deleteInstructionSet } from '../actions';
import { ChevronLeft, Save, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { InstructionSet, InstructionSection } from '@/types/manual-types';

interface EditInstructionClientProps {
    instructionSet: InstructionSet;
}

export default function EditInstructionClient({ instructionSet }: EditInstructionClientProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [name, setName] = useState(instructionSet.name);
    const [description, setDescription] = useState(instructionSet.description || '');
    const [sections, setSections] = useState<InstructionSection[]>(instructionSet.content || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Please enter a name for the instruction set.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await updateInstructionSet(instructionSet.id, {
                name,
                description,
                content: sections
            });
            showToast('Instruction set updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update instruction set:', error);
            showToast('Failed to update instruction set.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this instruction set? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await deleteInstructionSet(instructionSet.id);
            showToast('Instruction set deleted successfully!', 'success');
            router.push('/dashboard/instructions');
        } catch (error) {
            console.error('Failed to delete instruction set:', error);
            showToast('Failed to delete instruction set.', 'error');
            setIsDeleting(false);
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
                        <h1 className="text-2xl font-black tracking-tight text-white">Edit Instruction Set</h1>
                        <p className="text-white/60 text-sm">Update your instruction template.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={isSaving || isDeleting}
                        className="px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        DELETE
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isDeleting}
                        className="px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'SAVE CHANGES'}
                    </button>
                </div>
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
