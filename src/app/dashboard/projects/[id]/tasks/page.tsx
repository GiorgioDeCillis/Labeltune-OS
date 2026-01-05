import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectTasksClient } from '@/components/dashboard/ProjectTasksClient';

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    console.log('ProjectTasksPage: Viewing Project ID:', id);

    if (!project) notFound();

    // Fetch tasks with profiles and project info
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
            *,
            annotator:assigned_to (
                full_name,
                avatar_url
            ),
            reviewer:reviewed_by (
                full_name,
                avatar_url
            )
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });

    if (tasksError) {
        console.error('Error fetching tasks for project', id, tasksError);
    } else {
        console.log('Successfully fetched tasks for project', id, 'Count:', tasks?.length);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/projects/${id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Task Monitoring</h2>
                    <p className="text-muted-foreground">{project.name} • {tasks?.length || 0} Tasks</p>
                </div>
            </div>

            <ProjectTasksClient
                initialTasks={tasks || []}
                projectId={id}
                payRate={parseFloat(project.pay_rate || '0')}
            />
        </div>
    );
}
