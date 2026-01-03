import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { TaskBuilder } from '@/components/builder/TaskBuilder';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (!project) notFound();

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/projects/${id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Task Template Builder</h2>
                    <p className="text-muted-foreground text-sm">Design the workflow for {project.name}</p>
                </div>
            </div>

            <TaskBuilder project={project} />
        </div>
    );
}
