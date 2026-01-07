'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProjectDraft } from './actions';
import { useTransition } from 'react';

interface DeleteDraftButtonProps {
    projectId: string;
}

export function DeleteDraftButton({ projectId }: DeleteDraftButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm('Sei sicuro di voler eliminare questa bozza?')) {
            startTransition(async () => {
                try {
                    await deleteProjectDraft(projectId);
                } catch (error) {
                    console.error('Failed to delete draft:', error);
                    alert('Errore durante l\'eliminazione della bozza');
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center border border-red-500/20 hover:border-red-500/40"
            title="Elimina bozza"
        >
            {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </button>
    );
}
