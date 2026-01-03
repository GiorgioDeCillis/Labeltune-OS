import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CourseBuilder } from '@/components/education/CourseBuilder';

export default async function NewCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // This is PROJECT ID
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify Project Access (PM/Admin only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'pm' && profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
                    <p className="text-muted-foreground">Add training material to your project.</p>
                </div>
            </div>

            <CourseBuilder projectId={id} />
        </div>
    );
}
