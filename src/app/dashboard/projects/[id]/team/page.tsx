import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { User, Shield, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify Access
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // 1. Fetch Project Courses
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .eq('project_id', id);

    const requiredCourseIds = courses?.map(c => c.id) || [];

    // 2. Fetch All Profiles (Simulating a team list)
    // In a real app, you'd filter by organization or project assignment
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // Filter out admins if you want
        .order('role');

    // 3. Fetch All Progress for this project's courses
    const { data: progress } = await supabase
        .from('user_course_progress')
        .select('*')
        .in('course_id', requiredCourseIds);

    // 4. Determine Qualification Status
    const team = users?.map(u => {
        const userProgress = progress?.filter(p => p.user_id === u.id);
        const completedCourses = userProgress?.filter(p => p.status === 'completed').length || 0;
        const totalCourses = requiredCourseIds.length;
        const isQualified = totalCourses === 0 || completedCourses === totalCourses;

        return {
            ...u,
            completedCourses,
            totalCourses,
            isQualified
        };
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Project Workers</h2>
                    <p className="text-muted-foreground">Manage annotators and verify qualifications.</p>
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-muted-foreground">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Training Status</th>
                            <th className="p-4">Qualified</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {team.map((worker) => (
                            <tr key={worker.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User className="w-4 h-4" />
                                    </div>
                                    {worker.email || 'User'}
                                </td>
                                <td className="p-4">
                                    <span className="capitalize px-2 py-1 rounded bg-white/10 text-xs font-bold text-muted-foreground">
                                        {worker.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-white/10 rounded-full w-24 overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${(worker.completedCourses / Math.max(worker.totalCourses, 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {worker.completedCourses}/{worker.totalCourses}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {worker.isQualified ? (
                                        <span className="text-green-500 flex items-center gap-1 text-sm font-bold">
                                            <CheckCircle className="w-4 h-4" /> Yes
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1 text-sm font-bold">
                                            <XCircle className="w-4 h-4" /> No
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-sm text-muted-foreground hover:text-white underline">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
