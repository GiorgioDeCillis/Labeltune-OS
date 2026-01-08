import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { FileText, Plus, ChevronRight, BookOpen } from 'lucide-react';
import { InstructionSet } from '@/types/manual-types';

export default async function InstructionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch instructions
    const { data: instructions } = await supabase
        .from('instructions')
        .select('*')
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(instructions || []).length > 0 ? (
                    instructions?.map((instruction) => (
                        <Link
                            key={instruction.id}
                            href={`/dashboard/instructions/${instruction.id}`}
                            className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group flex flex-col gap-4 border border-white/5"
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
                                <div className="p-1 rounded-full bg-white/5 text-primary group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-white/5 opacity-50">
                        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium">No instructions created yet</h3>
                        <p className="text-sm text-muted-foreground">Get started by creating your first instruction set.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
