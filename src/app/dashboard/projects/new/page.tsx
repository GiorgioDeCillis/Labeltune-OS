
import { ProjectCreationWizard } from './project-creation-wizard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getProject } from '../actions';

interface Props {
    searchParams: Promise<{ draftId?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
    const { draftId } = await searchParams;
    const supabase = await createClient();
    const { data: courses } = await supabase.from('courses').select('*');

    let initialData = null;
    if (draftId) {
        initialData = await getProject(draftId);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {initialData ? 'Resume Project Creation' : 'Create New Project'}
                    </h2>
                    <p className="text-muted-foreground">
                        {initialData ? `Continuing ${initialData.name}` : 'Select a template or start from scratch.'}
                    </p>
                </div>
            </div>

            <ProjectCreationWizard
                availableCourses={courses || []}
                initialData={initialData}
            />
        </div>
    );
}
