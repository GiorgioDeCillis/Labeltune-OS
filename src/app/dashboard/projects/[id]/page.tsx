import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Settings, ListTodo } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (!project) notFound();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/projects/${id}/builder`}>
                        <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                            <Settings className="w-4 h-4" /> Open Builder
                        </button>
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-all">
                        <ListTodo className="w-4 h-4" /> View Tasks
                    </button>
                </div>
            </div>

            <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-white/10">
                <p className="text-muted-foreground">Task management interface coming soon...</p>
            </div>
        </div>
    );
}
