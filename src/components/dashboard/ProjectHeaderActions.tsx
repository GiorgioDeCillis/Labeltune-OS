'use client';

import { ListTodo, Settings } from 'lucide-react';
import Link from 'next/link';

interface ProjectHeaderActionsProps {
    id: string;
    guidelines: string | InstructionSection[];
}

export function ProjectHeaderActions({ id }: { id: string }) {
    return (
        <div className="flex gap-2">
            <Link href={`/dashboard/projects/new?draftId=${id}`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                    <Settings className="w-4 h-4" /> Edit Project
                </button>
            </Link>
            <Link href={`/dashboard/projects/${id}/tasks`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-all">
                    <ListTodo className="w-4 h-4" /> View Tasks
                </button>
            </Link>
        </div>
    );
}
