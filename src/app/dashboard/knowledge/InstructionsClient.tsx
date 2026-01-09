'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, FileText, Trash2, BookOpen, Layout, GraduationCap, Archive, Search, Pencil, Check, X, Loader2 } from 'lucide-react';
import { deleteInstructionSet, UnifiedInstructionItem, renameInstruction } from './actions';
import { deleteCourse } from './courses/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface InstructionsClientProps {
    instructions: UnifiedInstructionItem[];
    userProfile: any;
}

export default function InstructionsClient({ instructions }: InstructionsClientProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [instructionToDelete, setInstructionToDelete] = useState<UnifiedInstructionItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Rename State
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    const isAdmin = userProfile?.role === 'admin';
    const isPM = userProfile?.role === 'pm';
    const displayRole = isAdmin ? 'admin' : (isPM ? 'pm' : 'annotator');

    const getDisplayName = (inst: UnifiedInstructionItem) => {
        if (isAdmin || isPM) {
            return inst.admin_name || inst.name;
        }
        return inst.name;
    };

    const handleRename = async (instruction: UnifiedInstructionItem) => {
        if (!editedName.trim() || editedName === getDisplayName(instruction)) {
            setRenamingId(null);
            return;
        }

        setIsRenaming(true);
        try {
            await renameInstruction(instruction.id, editedName, displayRole);
            showToast('Name updated successfully', 'success');
            router.refresh();
        } catch (error: any) {
            showToast(error.message || 'Failed to rename', 'error');
        } finally {
            setIsRenaming(false);
            setRenamingId(null);
        }
    };

    const filteredInstructions = instructions.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const platformInst = filteredInstructions.filter(i => i.type === 'platform');
    const uploadedInst = filteredInstructions.filter(i => i.type === 'uploaded');
    const projectInst = filteredInstructions.filter(i => i.type === 'project');
    const courseInst = filteredInstructions.filter(i => i.type === 'course');

    const handleDeleteClick = (e: React.MouseEvent, instruction: UnifiedInstructionItem) => {
        e.preventDefault();
        e.stopPropagation();
        setInstructionToDelete(instruction);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!instructionToDelete) return;
        setIsDeleting(true);
        try {
            if (instructionToDelete.type === 'course') {
                await deleteCourse(instructionToDelete.id);
            } else {
                await deleteInstructionSet(instructionToDelete.id);
            }
            showToast(`${instructionToDelete.type === 'course' ? 'Course' : 'Instruction set'} deleted successfully`, 'success');
            router.refresh();
        } catch (error: any) {
            showToast(error.message || `Failed to delete ${instructionToDelete.type === 'course' ? 'course' : 'instruction set'}`, 'error');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setInstructionToDelete(null);
        }
    };

    const InstructionCard = ({ instruction }: { instruction: UnifiedInstructionItem }) => {
        const isDeletable = (instruction.type === 'platform' || instruction.type === 'uploaded' || instruction.type === 'course') && !instruction.project_id;
        const iconStyle = {
            platform: "bg-blue-500/10 text-blue-400",
            uploaded: "bg-purple-500/10 text-purple-400",
            project: "bg-amber-500/10 text-amber-400",
            course: "bg-emerald-500/10 text-emerald-400"
        }[instruction.type] || "bg-primary/10 text-primary";

        const Icon = ({
            platform: FileText,
            uploaded: Archive,
            project: Layout,
            course: GraduationCap
        }[instruction.type]) || FileText;

        const href = {
            platform: `/dashboard/knowledge/${instruction.id}`,
            uploaded: `/dashboard/knowledge/${instruction.id}`,
            project: `/dashboard/projects/${instruction.id}`,
            course: `/dashboard/knowledge/courses/${instruction.id}`
        }[instruction.type] || '#';

        return (
            <Link
                href={href}
                className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all group flex flex-col gap-4 border border-white/5 relative hover:border-white/10 hover:shadow-2xl"
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyle} group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between group/title">
                        {renamingId === instruction.id ? (
                            <div className="flex items-center gap-2 w-full" onClick={(e) => e.preventDefault()}>
                                <input
                                    autoFocus
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRename(instruction);
                                        if (e.key === 'Escape') setRenamingId(null);
                                    }}
                                    className="bg-white/5 border border-primary/50 rounded-lg px-2 py-1 text-sm font-bold text-white w-full focus:outline-none"
                                    disabled={isRenaming}
                                />
                                <button
                                    onClick={(e) => { e.preventDefault(); handleRename(instruction); }}
                                    disabled={isRenaming}
                                    className="p-1 rounded-md hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                >
                                    {isRenaming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); setRenamingId(null); }}
                                    className="p-1 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors truncate">
                                    {getDisplayName(instruction)}
                                </h3>
                                {(instruction.type === 'platform' || instruction.type === 'uploaded') && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditedName(getDisplayName(instruction));
                                            setRenamingId(instruction.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-primary transition-all opacity-0 group-hover/title:opacity-100"
                                        title="Rename"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {instruction.description || 'No description provided.'}
                    </p>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <BookOpen className="w-3 h-3" />
                            <span>
                                {Array.isArray(instruction.content) ? `${instruction.content.length} Sections` : '1 Document'}
                            </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${instruction.type === 'platform' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                            instruction.type === 'uploaded' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' :
                                instruction.type === 'project' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' :
                                    'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                            }`}>
                            {instruction.type}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isDeletable && (
                            <button
                                onClick={(e) => handleDeleteClick(e, instruction)}
                                className="p-2 rounded-full bg-white/5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all sm:opacity-0 group-hover:opacity-100"
                                title="Delete Instruction"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="p-1.5 rounded-full bg-white/5 text-primary group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    const SectionHeader = ({ title, count, icon: Icon, color }: { title: string, count: number, icon: any, color: string }) => {
        if (count === 0) return null;
        return (
            <div className="space-y-6 pt-8 first:pt-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-8 ${color} rounded-full inline-block`}></span>
                        {title}
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 text-xs font-bold text-muted-foreground">{count}</span>
                    </h2>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search instructions, projects, or courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors shadow-2xl"
                />
            </div>

            <div className="space-y-12">
                <div className="space-y-6">
                    <SectionHeader title="Platform Instructions" count={platformInst.length} icon={FileText} color="bg-blue-500" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platformInst.map(inst => <InstructionCard key={inst.id} instruction={inst} />)}
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionHeader title="User Uploaded" count={uploadedInst.length} icon={Archive} color="bg-purple-500" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {uploadedInst.map(inst => <InstructionCard key={inst.id} instruction={inst} />)}
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionHeader title="Project Guidelines" count={projectInst.length} icon={Layout} color="bg-amber-500" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectInst.map(inst => <InstructionCard key={inst.id} instruction={inst} />)}
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionHeader title="Course Materials" count={courseInst.length} icon={GraduationCap} color="bg-emerald-500" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseInst.map(inst => <InstructionCard key={inst.id} instruction={inst} />)}
                    </div>
                </div>

                {filteredInstructions.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-white/5 opacity-50">
                        <Search className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium">No results found</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            We couldn't find any instructions matching &quot;{searchQuery}&quot;. Try adjusting your filter.
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel p-6 rounded-2xl max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2 text-white">Conferma eliminazione</h3>
                        <p className="text-muted-foreground mb-6">
                            Sei sicuro di voler eliminare {instructionToDelete?.type === 'course' ? 'il corso' : 'le istruzioni'} &quot;{instructionToDelete?.name}&quot;? Questa azione non può essere annullata.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium text-white"
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
        </div>
    );
}
