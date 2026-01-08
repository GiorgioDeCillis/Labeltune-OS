'use client';

import { useState } from 'react';
import { Settings, ListTodo, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { EditInstructionsModal } from '@/components/dashboard/EditInstructionsModal';
import { InstructionSection } from '@/types/manual-types';

interface ProjectHeaderActionsProps {
    id: string;
    guidelines: string | InstructionSection[];
}

export function ProjectHeaderActions({ id, guidelines }: ProjectHeaderActionsProps) {
    const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => setIsInstructionsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                >
                    <FileText className="w-4 h-4" /> Edit Instructions
                </button>
                <Link href={`/dashboard/projects/${id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                        <Settings className="w-4 h-4" /> Edit Project
                    </button>
                </Link>
                <Link href={`/dashboard/projects/${id}/team`}>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                        <Users className="w-4 h-4" /> Team
                    </button>
                </Link>
                <Link href={`/dashboard/projects/${id}/builder`}>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                        <Settings className="w-4 h-4" /> Open Builder
                    </button>
                </Link>
                <Link href={`/dashboard/projects/${id}/tasks`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-all">
                        <ListTodo className="w-4 h-4" /> View Tasks
                    </button>
                </Link>
            </div>

            <EditInstructionsModal
                isOpen={isInstructionsModalOpen}
                onClose={() => setIsInstructionsModalOpen(false)}
                projectId={id}
                initialGuidelines={guidelines}
            />
        </>
    );
}
