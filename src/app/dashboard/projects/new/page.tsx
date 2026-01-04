

import { ProjectCreationWizard } from './project-creation-wizard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewProjectPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create New Project</h2>
                    <p className="text-muted-foreground">Select a template or start from scratch.</p>
                </div>
            </div>

            <ProjectCreationWizard />
        </div>
    );
}
