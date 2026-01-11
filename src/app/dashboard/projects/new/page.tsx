
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

    // Access Control: Restrict Attempters
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'attempter') {
            // Redirect attempters away from this page
            // If there is a draftId (project id), redirect to project details causing further redirect if needed, or just projects list
            // Safer to just go to projects list or dashboard
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
                    <p className="text-muted-foreground">You do not have permission to access this page.</p>
                    <Link href="/dashboard/projects">
                        <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                            Return to Projects
                        </button>
                    </Link>
                </div>
            );
        }
    }

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
                        {initialData ? (initialData.status === 'draft' ? 'Resume Project Creation' : 'Edit Project') : 'Create New Project'}
                    </h2>
                    <p className="text-muted-foreground">
                        {initialData ? (initialData.status === 'draft' ? `Continuing ${initialData.name}` : `Modifying ${initialData.name}`) : 'Select a template or start from scratch.'}
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
