'use client';

import { useState } from 'react';
import { User, CheckCircle, XCircle, Trash2, Plus, Search, Pause, Play, ArrowLeft, Users } from 'lucide-react';
import { assignUserToProject, removeUserFromProject, updateAssigneeStatus } from '@/app/dashboard/projects/actions';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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
    isAssigned: boolean;
    status: 'active' | 'paused' | 'inactive';
}

interface TeamManagementClientProps {
    projectId: string;
    initialMembers: TeamMember[];
}

export function TeamManagementClient({ projectId, initialMembers }: TeamManagementClientProps) {
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [showAddView, setShowAddView] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; member: TeamMember | null }>({
        isOpen: false,
        member: null
    });

    const handleAssign = async (member: TeamMember) => {
        if (processingId) return;
        setProcessingId(member.id);
        try {
            await assignUserToProject(projectId, member.id);
            showToast('Member added to team', 'success');
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAssigned: true, status: 'active' } : m));
        } catch (error) {
            console.error('Failed to add member:', error);
            showToast('Failed to add member', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemove = async (member: TeamMember) => {
        setConfirmDelete({ isOpen: true, member });
    };

    const executeRemove = async () => {
        if (!confirmDelete.member || processingId) return;
        const member = confirmDelete.member;

        setProcessingId(member.id);
        setConfirmDelete({ isOpen: false, member: null });
        try {
            await removeUserFromProject(projectId, member.id);
            showToast('Member removed from team', 'success');
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAssigned: false, status: 'inactive' } : m));
        } catch (error) {
            console.error('Failed to remove member:', error);
            showToast('Failed to remove member', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleToggleStatus = async (member: TeamMember) => {
        if (processingId) return;
        const newStatus = member.status === 'active' ? 'paused' : 'active';

        setProcessingId(member.id);
        try {
            await updateAssigneeStatus(projectId, member.id, newStatus);
            showToast(`Member ${newStatus === 'active' ? 'resumed' : 'paused'}`, 'success');
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const normalize = (str?: string) => (str || '').toLowerCase();

    const filteredMembers = members.filter(m => {
        // Apply view filter (Team vs Add)
        if (showAddView) {
            if (m.isAssigned) return false;
        } else {
            if (!m.isAssigned) return false;
        }

        const matchesQuery =
            normalize(m.full_name).includes(normalize(filterQuery)) ||
            normalize(m.email).includes(normalize(filterQuery));

        const matchesTag = !tagFilter || m.tags?.some(tag => normalize(tag).includes(normalize(tagFilter)));

        return matchesQuery && matchesTag;
    });

    const sortedMembers = [...filteredMembers].sort((a, b) => {
        return (a.full_name || '').localeCompare(b.full_name || '');
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {showAddView ? 'Add Members' : 'Project Workers'}
                    </h2>
                    <p className="text-muted-foreground">
                        {showAddView
                            ? 'Search and add new workers to the project.'
                            : 'Manage currently assigned workers and their status.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddView(!showAddView)}
                    className="px-4 py-2 bg-primary text-black rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    {showAddView ? (
                        <>
                            <ArrowLeft className="w-4 h-4" /> Back to Team
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" /> Add Members
                        </>
                    )}
                </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden p-4 space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="Filter by tag..."
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-muted-foreground">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Tags</th>
                                <th className="p-4">Role</th>
                                {!showAddView && <th className="p-4">Status</th>}
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedMembers.map((worker) => (
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
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="capitalize px-2 py-1 rounded bg-white/10 text-xs font-bold text-muted-foreground">
                                            {worker.role}
                                        </span>
                                    </td>
                                    {!showAddView && (
                                        <td className="p-4">
                                            {worker.status === 'active' ? (
                                                <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-yellow-500 font-bold text-xs flex items-center gap-1">
                                                    <Pause className="w-3 h-3" /> Paused
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {showAddView ? (
                                                <button
                                                    onClick={() => handleAssign(worker)}
                                                    disabled={processingId === worker.id}
                                                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {processingId === worker.id ? 'Adding...' : <><Plus className="w-3 h-3" /> Add to Team</>}
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleStatus(worker)}
                                                        disabled={processingId === worker.id}
                                                        title={worker.status === 'active' ? 'Pause worker' : 'Resume worker'}
                                                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${worker.status === 'active'
                                                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                            : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                            }`}
                                                    >
                                                        {processingId === worker.id ? '...' : (
                                                            worker.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(worker)}
                                                        disabled={processingId === worker.id}
                                                        title="Remove from project"
                                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {processingId === worker.id ? '...' : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                                        {showAddView
                                            ? 'No eligible users found to add.'
                                            : 'No workers assigned to this project yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, member: null })}
                onConfirm={executeRemove}
                title="Remove Team Member"
                description={`Are you sure you want to remove ${confirmDelete.member?.full_name || 'this member'} from the project? This action cannot be undone.`}
                confirmText="Remove Member"
                type="danger"
                isProcessing={processingId === confirmDelete.member?.id}
            />
        </div>
    );
}
