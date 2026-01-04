'use client';

import { useState } from 'react';
import { User, Shield, CheckCircle, XCircle, Trash2, Plus, Search } from 'lucide-react';
import { AddMemberModal } from '@/components/dashboard/AddMemberModal';
import { removeUserFromProject } from '@/app/dashboard/projects/actions';
import { useToast } from '@/components/Toast';

interface TeamMember {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    avatar_url?: string;
    tags?: string[];
    completedCourses: number;
    totalCourses: number;
    isQualified: boolean;
}

interface TeamManagementClientProps {
    projectId: string;
    initialMembers: TeamMember[];
}

export function TeamManagementClient({ projectId, initialMembers }: TeamManagementClientProps) {
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [filterQuery, setFilterQuery] = useState('');

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member from the project?')) return;

        setRemovingId(userId);
        try {
            await removeUserFromProject(projectId, userId);
            setMembers(prev => prev.filter(m => m.id !== userId));
            showToast('Member removed successfully', 'success');
        } catch (error) {
            console.error('Failed to remove member:', error);
            showToast('Failed to remove member', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const handleMemberAdded = () => {
        // In a real implementation with real-time updates or revalidation,
        // we might not need to manually fetch, but for smoother UX we could
        // trigger a refresh or simply rely on the server action's revalidatePath
        // effectively reloading the page content on next navigation/refresh.
        // For now, we can rely on a page refresh or similar.
        // Or simpler: just reload the page to get fresh data
        window.location.reload();
    };

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        m.tags?.some(tag => tag.toLowerCase().includes(filterQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Project Workers</h2>
                    <p className="text-muted-foreground">Manage annotators and verify qualifications.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Member
                </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden p-4 space-y-4">
                {/* Local Filter */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Filter list by name, email or tag..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-muted-foreground">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Tags</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Training Status</th>
                                <th className="p-4">Qualified</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredMembers.map((worker) => (
                                <tr key={worker.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                            {worker.avatar_url ? (
                                                <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{worker.full_name || 'User'}</div>
                                            <div className="text-xs text-muted-foreground">{worker.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                                            {worker.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-muted-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(!worker.tags || worker.tags.length === 0) && <span className="text-xs text-muted-foreground">-</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="capitalize px-2 py-1 rounded bg-white/10 text-xs font-bold text-muted-foreground">
                                            {worker.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full w-24 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${(worker.completedCourses / Math.max(worker.totalCourses, 1)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {worker.completedCourses}/{worker.totalCourses}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {worker.isQualified ? (
                                            <span className="text-green-500 flex items-center gap-1 text-sm font-bold">
                                                <CheckCircle className="w-4 h-4" /> Yes
                                            </span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1 text-sm font-bold">
                                                <XCircle className="w-4 h-4" /> No
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleRemoveMember(worker.id)}
                                            disabled={removingId === worker.id}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                                            title="Remove from project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                                        No members found matching your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                projectId={projectId}
                existingMemberIds={members.map(m => m.id)}
                onMemberAdded={handleMemberAdded}
            />
        </div>
    );
}
