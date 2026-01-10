import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import InstructionsClient from './InstructionsClient';
import { getUnifiedInstructions } from './actions';

export default async function InstructionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [instructions, { data: profile }] = await Promise.all([
        getUnifiedInstructions(),
        supabase.from('profiles').select('*').eq('id', user?.id).single()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Knowledge Base
                    </h1>
                    <p className="text-white/60 mt-1">
                        Manage reusable templates, project-specific guidelines, and training materials.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/knowledge/courses/new">
                        <button className="px-6 py-2.5 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-all shadow-lg flex items-center gap-2 border border-primary/30">
                            <Plus className="w-4 h-4" />
                            NEW COURSE
                        </button>
                    </Link>
                    <Link href="/dashboard/knowledge/new">
                        <button className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            NEW INSTRUCTION
                        </button>
                    </Link>
                </div>
            </div>

            <InstructionsClient instructions={instructions} userProfile={profile} />
        </div>
    );
}
