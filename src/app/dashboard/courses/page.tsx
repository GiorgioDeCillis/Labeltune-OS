import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { GraduationCap, Clock, ChevronRight, BookOpen } from 'lucide-react';

export default async function CoursesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id || '')
        .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'pm';

    // Fetch courses
    const { data: courses } = await supabase
        .from('courses')
        .select('*');

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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses || []).length > 0 ? (
                    courses?.map((course) => (
                        <Link
                            key={course.id}
                            href={`/dashboard/courses/${course.id}`}
                            className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group flex flex-col gap-4 border border-white/5"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">{course.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {course.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{course.duration || 'Variable'}</span>
                                </div>
                                <div className="p-1 rounded-full bg-white/5 text-primary group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-white/5 opacity-50">
                        <GraduationCap className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium">No courses available yet</h3>
                        <p className="text-sm text-muted-foreground">Check back later for new training materials.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
