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

    // Fetch tasks
    const { data: rawTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

    // Manually fetch profiles since foreign key cache seems broken in Supabase
    let tasks: any[] = [];
    if (rawTasks && rawTasks.length > 0) {
        const userIds = Array.from(new Set([
            ...rawTasks.map(t => t.assigned_to),
            ...rawTasks.map(t => t.reviewed_by)
        ].filter(Boolean)));

        let enrichedTasks = rawTasks;

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            if (profiles) {
                const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
                enrichedTasks = rawTasks.map(task => ({
                    ...task,
                    annotator: task.assigned_to ? profileMap[task.assigned_to] : null,
                    reviewer: task.reviewed_by ? profileMap[task.reviewed_by] : null
                }));
            }
        }

        // Apply logical status sorting
        const statusPriority: Record<string, number> = {
            'approved': 1,
            'completed': 2,
            'in_progress': 3,
            'pending': 4
        };

        tasks = [...enrichedTasks].sort((a, b) => {
            const priorityA = statusPriority[a.status] || 99;
            const priorityB = statusPriority[b.status] || 99;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Secondary sort by created_at desc (already sorted by query, but good to maintain)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }

    if (tasksError) {
        console.error('Error fetching tasks for project', id, tasksError);
    } else {
        console.log('Successfully fetched and sorted tasks for project', id, 'Count:', tasks?.length);
    }

    // Robust parsing for pay_rate to pass as number
    const rawRate = project.pay_rate || '0';
    const matches = rawRate.toString().match(/(\d+(?:[.,]\d+)?)/);
    const cleanRate = matches ? matches[0].replace(',', '.') : '0';
    const payRate = parseFloat(cleanRate) || 0;

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
                payRate={payRate}
            />
        </div>
    );
}
