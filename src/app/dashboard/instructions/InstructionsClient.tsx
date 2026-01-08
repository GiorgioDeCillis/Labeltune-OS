'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, FileText, Trash2, BookOpen } from 'lucide-react';
import { deleteInstructionSet } from './actions';
import { useRouter } from 'next/navigation';

interface InstructionSet {
    id: string;
    name: string;
    description: string | null;
    content: any;
    project_id: string | null;
    is_uploaded?: boolean;
}

interface InstructionsClientProps {
    instructions: InstructionSet[];
}

export default function InstructionsClient({ instructions }: InstructionsClientProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [instructionToDelete, setInstructionToDelete] = useState<InstructionSet | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const uploadedInstructions = instructions.filter(i => i.is_uploaded);
    const platformInstructions = instructions.filter(i => !i.is_uploaded);

    const handleDeleteClick = (e: React.MouseEvent, instruction: InstructionSet) => {
        e.preventDefault();
        e.stopPropagation();
        setInstructionToDelete(instruction);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!instructionToDelete) return;
        setIsDeleting(true);
        try {
            await deleteInstructionSet(instructionToDelete.id);
            router.refresh();
        } catch (error: any) {
            console.error('Failed to delete instruction set:', error);
            alert(`Errore durante l'eliminazione: ${error.message || 'Impossibile eliminare le istruzioni'}`);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setInstructionToDelete(null);
        }
    };

    const InstructionCard = ({ instruction }: { instruction: InstructionSet }) => (
        <Link
            href={`/dashboard/instructions/${instruction.id}`}
            className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group flex flex-col gap-4 border border-white/5 relative"
        >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-lg">
                <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">{instruction.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {instruction.description || 'No description provided.'}
                </p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{(instruction.content || []).length} Sections</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleDeleteClick(e, instruction)}
                        disabled={!!instruction.project_id}
                        className={`p-2 rounded-full transition-all ${instruction.project_id
                            ? 'bg-white/5 text-muted-foreground/50 cursor-not-allowed'
                            : 'bg-white/5 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                            }`}
                        title={instruction.project_id ? 'Collegato a un progetto' : 'Elimina istruzione'}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 rounded-full bg-white/5 text-primary group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <>
            <div className="space-y-12">
                {/* Uploaded Instructions Section */}
                {uploadedInstructions.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
                                Uploaded Instructions
                            </h2>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {uploadedInstructions.map((instruction) => (
                                <InstructionCard key={instruction.id} instruction={instruction} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Platform Instructions Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
                            Platform Instructions
                        </h2>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platformInstructions.length > 0 ? (
                            platformInstructions.map((instruction) => (
                                <InstructionCard key={instruction.id} instruction={instruction} />
                            ))
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-white/5 opacity-50">
                                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium">No platform instructions found</h3>
                                <p className="text-sm text-muted-foreground">Create a new instruction set to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {
                deleteDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="glass-panel p-6 rounded-2xl max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold mb-2">Conferma eliminazione</h3>
                            <p className="text-muted-foreground mb-6">
                                Sei sicuro di voler eliminare le istruzioni &quot;{instructionToDelete?.name}&quot;? Questa azione non può essere annullata.
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
                )
            }
        </>
    );
}
