import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import InstructionsClient from './InstructionsClient';
import { getUnifiedInstructions } from './actions';

export default async function InstructionsPage() {
    const instructions = await getUnifiedInstructions();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Instructions & Knowledge Base</h1>
                    <p className="text-white/60 mt-2">
                        Manage reusable templates, project-specific guidelines, and course content.
                    </p>
                </div>
                <Link href="/dashboard/instructions/new">
                    <button className="px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        NEW INSTRUCTION
                    </button>
                </Link>
            </div>

            <InstructionsClient instructions={instructions} />
        </div>
    );
}
