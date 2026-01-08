'use client';

import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { ProjectInstructionsEditor } from '@/components/dashboard/ProjectInstructionsEditor';
import { InstructionSection } from '@/types/manual-types';
import { updateProjectInstructions } from '@/app/dashboard/projects/actions';
import { useToast } from '@/components/Toast';

interface EditInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    initialGuidelines: string | InstructionSection[];
}

export function EditInstructionsModal({ isOpen, onClose, projectId, initialGuidelines }: EditInstructionsModalProps) {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Parse initial guidelines if they are a string
    const parsedGuidelines: InstructionSection[] = React.useMemo(() => {
        if (typeof initialGuidelines === 'string') {
            try {
                return JSON.parse(initialGuidelines);
            } catch (e) {
                return [];
            }
        }
        return initialGuidelines;
    }, [initialGuidelines]);

    const [sections, setSections] = useState<InstructionSection[]>(parsedGuidelines);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProjectInstructions(projectId, JSON.stringify(sections));
            showToast('Instructions updated successfully', 'success');
            onClose();
        } catch (error) {
            console.error('Failed to save instructions:', error);
            showToast('Failed to update instructions', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0A0A0A] rounded-2xl shadow-2xl flex flex-col border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Edit Project Instructions</h2>
                            <p className="text-sm text-muted-foreground">Modify the guidelines for this project.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden p-6 bg-[#0A0A0A]">
                    <ProjectInstructionsEditor
                        sections={sections}
                        onChange={setSections}
                    />
                </div>
            </div>
        </div>
    );
}
