'use client';

import { useState, useTransition } from 'react';

import { Trash2, Loader2 } from 'lucide-react';
import { deleteProjectDraft } from './actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

interface DeleteDraftButtonProps {
    projectId: string;
}

export function DeleteDraftButton({ projectId }: DeleteDraftButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        setIsConfirmOpen(false);
        startTransition(async () => {
            try {
                await deleteProjectDraft(projectId);
                showToast('Bozza eliminata con successo', 'success');
                router.refresh();
            } catch (error) {
                console.error('Failed to delete draft:', error);
                showToast('Errore durante l\'eliminazione della bozza', 'error');
            }
        });
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                }}
                disabled={isPending}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center border border-red-500/10 hover:border-red-500/30"
                title="Elimina bozza"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Elimina Bozza"
                description="Sei sicuro di voler eliminare questa bozza? L'azione non può essere annullata."
                confirmText="Elimina"
                cancelText="Annulla"
                type="danger"
                isProcessing={isPending}
            />
        </>
    );
}
