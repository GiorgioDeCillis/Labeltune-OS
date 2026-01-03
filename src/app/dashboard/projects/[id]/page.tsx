import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, ListTodo, Wallet, Clock, BookOpen, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isPM = profile?.role === 'pm' || profile?.role === 'admin';

    // Fetch Linked Courses
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

    if (isPM) {
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

                <div className="glass-panel p-6 rounded-2xl border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Linked Courses (Training)</h3>
                        <Link href={`/dashboard/projects/${id}/courses/new`}>
                            <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                <Settings className="w-3 h-3" /> Manage Courses
                            </button>
                        </Link>
                    </div>
                    {(!courses || courses.length === 0) ? (
                        <div className="text-muted-foreground text-sm">No courses linked yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {courses.map(course => (
                                <div key={course.id} className="p-3 bg-white/5 rounded-lg flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <span className="font-medium">{course.title}</span>
                                    <span className="text-xs text-muted-foreground">{course.duration}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Annotator View (Outlier Style)
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header / Project Overview */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
                            <p className="text-muted-foreground text-sm">Manage your work and training for this project</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/5">
                    <div>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            {project.pay_rate || '$15.00 / hr'}
                            <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded">USD</span>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Deliverable Rate</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            $13.65 / task
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Assessment Rate</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            3h 30m
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Est. Time per Task</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Assessment</p>
                        <div className="font-bold text-lg">In Progress</div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
                        <div className="font-bold text-lg">{project.type || 'General'}</div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Link href="#" className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1">
                        View Pay Terms <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1">
                        View Project Guidelines <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Courses Section */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-bold">Courses</h2>
                </div>

                <div className="space-y-1">
                    {courses && courses.length > 0 ? courses.map((course) => (
                        <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
                            <div className="group p-4 -mx-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-muted-foreground text-sm max-w-2xl">{course.description}</p>
                                    <p className="text-xs text-muted-foreground pt-2">{course.duration || '30m'}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                    )) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No training courses required for this project.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
