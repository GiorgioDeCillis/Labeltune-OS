'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Clock, ChevronRight, BookOpen, Trash2, GraduationCap } from 'lucide-react';
import { deleteCourse } from './actions';
import { useRouter } from 'next/navigation';

interface Course {
    id: string;
    title: string;
    description: string | null;
    duration: string | null;
    project_id: string | null;
}

interface CoursesClientProps {
    courses: Course[];
    isAdmin: boolean;
}

export default function CoursesClient({ courses, isAdmin }: CoursesClientProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, course: Course) => {
        e.preventDefault();
        e.stopPropagation();
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        try {
            await deleteCourse(courseToDelete.id);
            router.refresh();
        } catch (error: any) {
            console.error('Failed to delete course:', error);
            alert(`Errore durante l'eliminazione: ${error.message || 'Impossibile eliminare il corso'}`);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
        }
    };

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/dashboard/courses/${course.id}`}
                            className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group flex flex-col gap-4 border border-white/5 relative"
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
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleDeleteClick(e, course)}
                                            disabled={!!course.project_id}
                                            className={`p-2 rounded-full transition-all ${course.project_id
                                                ? 'bg-white/5 text-muted-foreground/50 cursor-not-allowed'
                                                : 'bg-white/5 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                                                }`}
                                            title={course.project_id ? 'Collegato a un progetto' : 'Elimina corso'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="p-1 rounded-full bg-white/5 text-primary group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
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

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel p-6 rounded-2xl max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2">Conferma eliminazione</h3>
                        <p className="text-muted-foreground mb-6">
                            Sei sicuro di voler eliminare il corso &quot;{courseToDelete?.title}&quot;? Questa azione non può essere annullata.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors font-bold text-white disabled:opacity-50"
                            >
                                {isDeleting ? 'Eliminazione...' : 'Elimina'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
