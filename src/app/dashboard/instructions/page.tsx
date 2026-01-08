import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import InstructionsClient from './InstructionsClient';

export default async function InstructionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch instructions with project_id to check if deletable
    const { data: instructions } = await supabase
        .from('instructions')
        .select('id, name, description, content, project_id, is_uploaded')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Instruction Sets</h1>
                    <p className="text-white/60 mt-2">
                        Create and manage reusable instruction templates for your projects.
                    </p>
                </div>
                <Link href="/dashboard/instructions/new">
                    <button className="px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        NEW INSTRUCTION
                    </button>
                </Link>
            </div>

            <InstructionsClient instructions={instructions || []} />
        </div>
    );
}
