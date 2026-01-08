import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import EditInstructionClient from './client';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditInstructionPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: instructionSet } = await supabase
        .from('instructions')
        .select('*')
        .eq('id', id)
        .single();

    if (!instructionSet) {
        notFound();
    }

    return <EditInstructionClient instructionSet={instructionSet} />;
}
