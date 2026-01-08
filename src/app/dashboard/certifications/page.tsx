import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Award, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function CertificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch all courses
    const { data: courses } = await supabase
        .from('courses')
        .select(`
            *,
            project:projects(name)
        `);

    // Fetch user progress
    const { data: progress } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

    // Map progress to courses
    const certifications = courses?.map(course => {
        const userProgress = progress?.find(p => p.course_id === course.id);
        const isCompleted = userProgress?.status === 'completed';
        const completedCount = userProgress?.completed_lessons?.length || 0;

        return {
            ...course,
            status: userProgress?.status || 'not_started',
            completedCount,
            isCompleted
        };
    }) || [];

    const completedCerts = certifications.filter(c => c.isCompleted);
    const pendingCerts = certifications.filter(c => !c.isCompleted);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                    <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Access & Certifications</h1>
                    <p className="text-muted-foreground">Manage your qualifications to unlock more projects.</p>
                </div>
            </div>

            {/* Completed Certifications */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Active Certifications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedCerts.length > 0 ? completedCerts.map((cert) => (
                        <div key={cert.id} className="glass-panel p-6 rounded-xl border border-green-500/20 bg-green-500/5 flex justify-between items-center group">
                            <div>
                                <h3 className="font-bold text-lg">{cert.title}</h3>
                                <p className="text-sm text-muted-foreground">Project: {cert.project?.name}</p>
                                <div className="mt-2 text-xs font-mono text-green-400 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> VERIFIED
                                </div>
                            </div>
                            <Link href={`/dashboard/knowledge/courses/${cert.id}`}>
                                <button className="px-4 py-2 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                    Review
                                </button>
                            </Link>
                        </div>
                    )) : (
                        <div className="col-span-full p-8 border border-dashed border-white/10 rounded-xl text-center text-muted-foreground">
                            You haven't earned any certifications yet. Complete training courses to get certified.
                        </div>
                    )}
                </div>
            </div>

            {/* Pending / In Progress */}
            <div className="space-y-4 pt-8 border-t border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" /> Available Training
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingCerts.length > 0 ? pendingCerts.map((cert) => (
                        <div key={cert.id} className="glass-panel p-6 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/5 transition-colors">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cert.title}</h3>
                                <p className="text-sm text-muted-foreground">Project: {cert.project?.name}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {cert.status === 'in_progress' ? (
                                        <span className="text-yellow-500">In Progress ({cert.completedCount} lessons done)</span>
                                    ) : (
                                        'Not Started'
                                    )}
                                </div>
                            </div>
                            <Link href={`/dashboard/knowledge/courses/${cert.id}`}>
                                <button className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-white/90 transition-colors">
                                    {cert.status === 'in_progress' ? 'Resume' : 'Start'}
                                </button>
                            </Link>
                        </div>
                    )) : (
                        <div className="col-span-full p-8 border border-dashed border-white/10 rounded-xl text-center text-muted-foreground">
                            No training available at the moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
