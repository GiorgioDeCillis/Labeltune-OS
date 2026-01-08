import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id || '')
        .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'pm';

    // Fetch courses with project_id to check if deletable
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description, duration, project_id');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Courses & Training</h1>
                    <p className="text-white/60 mt-2">
                        Enhance your skills with our curated curriculum for data specialists.
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/dashboard/courses/new">
                        <button className="px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            NEW COURSE
                        </button>
                    </Link>
                )}
            </div>

            <CoursesClient courses={courses || []} isAdmin={isAdmin} />
        </div>
    );
}
