import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Folder, Calendar } from 'lucide-react';
import { DeleteDraftButton } from './delete-draft-button';

export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

    const isInternal = profile?.role === 'pm' || profile?.role === 'admin';

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage your data labeling campaigns.</p>
                </div>
                <Link href="/dashboard/projects/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-all">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </Link>
            </div>

            {(!projects || projects.length === 0) ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-white/10">
                    <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-bold">No projects yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
                    <Link href="/dashboard/projects/new">
                        <button className="text-primary hover:underline">Create Project</button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const isDraft = project.status === 'draft';
                        const href = isDraft ? `/dashboard/projects/new?draftId=${project.id}` : `/dashboard/projects/${project.id}`;

                        return (
                            <div key={project.id} className="relative group">
                                <Link href={href}>
                                    <div className="glass-panel p-6 rounded-xl hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-lg ${project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                isDraft ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-muted-foreground'
                                                }`}>
                                                <Folder className="w-6 h-6" />
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full border ${project.status === 'active' ? 'border-green-500/30 text-green-400' :
                                                isDraft ? 'border-yellow-500/30 text-yellow-400' : 'border-white/10 text-muted-foreground'
                                                }`}>
                                                {project.status === 'draft' ? 'Draft' : project.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-1">{project.description}</p>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                            {/* Spacer for the absolute button */}
                                            {isDraft && isInternal && <div className="w-8 h-8" />}
                                        </div>
                                    </div>
                                </Link>

                                {isDraft && isInternal && (
                                    <div className="absolute bottom-5 right-5 z-10">
                                        <DeleteDraftButton projectId={project.id} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
