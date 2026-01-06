import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { updateProject } from '@/app/dashboard/projects/actions';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';

const PROJECT_TYPE_OPTIONS = [
    { code: 'text_classification', name: 'Text Classification' },
    { code: 'image_classification', name: 'Image Classification' },
    { code: 'image_bounding_box', name: 'Object Detection' },
    { code: 'sentiment_analysis', name: 'Sentiment Analysis' },
    { code: 'generation', name: 'Chatbot Evaluation (RLHF)' },
    { code: 'audio_transcription', name: 'Audio Transcription' },
    { code: 'video_tracking', name: 'Video Object Tracking' },
    { code: 'time_series', name: 'Time Series Anomaly' },
    { code: 'pdf_extraction', name: 'PDF Data Extraction' },
    { code: 'rlhf_pogo', name: 'Safe & Helpful RLHF' },
];

const STATUS_OPTIONS = [
    { code: 'active', name: 'Active' },
    { code: 'paused', name: 'Paused' },
    { code: 'completed', name: 'Completed' },
    { code: 'archived', name: 'Archived' },
];

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Verify Access
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    const updateProjectWithId = updateProject.bind(null, id);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/projects/${id}`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
                    <p className="text-muted-foreground">Update project details and settings.</p>
                </div>
            </div>

            <form action={updateProjectWithId} className="glass-panel p-8 rounded-xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Project Name</label>
                    <input
                        name="name"
                        defaultValue={project.name}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Description</label>
                    <textarea
                        name="description"
                        defaultValue={project.description || ''}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary h-32"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 !overflow-visible">
                    <div className="space-y-2 !overflow-visible">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Project Type</label>
                        <CustomSelect
                            name="type"
                            label="Project Type"
                            placeholder="Select a type"
                            options={PROJECT_TYPE_OPTIONS}
                            defaultValue={project.type}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Pay Rate</label>
                        <input
                            name="pay_rate"
                            defaultValue={project.pay_rate || '$15.00 / hr'}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Max Task Time (min)</label>
                        <input
                            name="max_task_time"
                            type="number"
                            defaultValue={project.max_task_time ? Math.round(project.max_task_time / 60) : ''}
                            placeholder="30"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Total Tasks</label>
                        <input
                            name="total_tasks"
                            type="number"
                            defaultValue={project.total_tasks || ''}
                            placeholder="1000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2 !overflow-visible">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Status</label>
                    <CustomSelect
                        name="status"
                        label="Status"
                        placeholder="Select status"
                        options={STATUS_OPTIONS}
                        defaultValue={project.status}
                    />
                </div>


                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
