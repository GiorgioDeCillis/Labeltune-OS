'use client';

import { useState, useMemo } from 'react';
import { User, CheckCircle, XCircle, Trash2, Plus, Search, Pause, Play, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { assignUserToProject, removeUserFromProject, updateAssigneeStatus, assignUsersToProject, removeUsersFromProject, updateAssigneesStatus } from '@/app/dashboard/projects/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getDefaultAvatar } from '@/utils/avatar';
import CustomSelect from '@/components/CustomSelect';

interface TeamMember {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    avatar_url?: string;
    tags?: string[];
    locale_tag?: string;
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
    const [selectedDomain, setSelectedDomain] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [showAddView, setShowAddView] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; member: TeamMember | null; isBulk: boolean }>({
        isOpen: false,
        member: null,
        isBulk: false
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
        setConfirmDelete({ isOpen: true, member, isBulk: false });
    };

    const handleBulkRemove = async () => {
        setConfirmDelete({ isOpen: true, member: null, isBulk: true });
    };

    const executeRemove = async () => {
        if (processingId || isBulkProcessing) return;

        if (confirmDelete.isBulk) {
            setIsBulkProcessing(true);
            try {
                const ids = Array.from(selectedIds);
                await removeUsersFromProject(projectId, ids);
                showToast(`${ids.length} members removed from team`, 'success');
                setMembers(prev => prev.map(m => ids.includes(m.id) ? { ...m, isAssigned: false, status: 'inactive' } : m));
                setSelectedIds(new Set());
            } catch (error) {
                console.error('Failed to remove members:', error);
                showToast('Failed to remove members', 'error');
            } finally {
                setIsBulkProcessing(false);
                setConfirmDelete({ isOpen: false, member: null, isBulk: false });
            }
            return;
        }

        if (!confirmDelete.member) return;
        const member = confirmDelete.member;

        setProcessingId(member.id);
        setConfirmDelete({ isOpen: false, member: null, isBulk: false });
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

    const handleBulkStatusChange = async (status: 'active' | 'paused') => {
        if (isBulkProcessing) return;
        setIsBulkProcessing(true);
        try {
            const ids = Array.from(selectedIds);
            await updateAssigneesStatus(projectId, ids, status);
            showToast(`${ids.length} members updated to ${status}`, 'success');
            setMembers(prev => prev.map(m => ids.includes(m.id) ? { ...m, status } : m));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkAssign = async () => {
        if (isBulkProcessing) return;
        setIsBulkProcessing(true);
        try {
            const ids = Array.from(selectedIds);
            await assignUsersToProject(projectId, ids);
            showToast(`${ids.length} members added to team`, 'success');
            setMembers(prev => prev.map(m => ids.includes(m.id) ? { ...m, isAssigned: true, status: 'active' } : m));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Failed to add members:', error);
            showToast('Failed to add members', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredMembers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredMembers.map(m => m.id)));
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

        const matchesDomain = !selectedDomain || normalize(m.locale_tag) === normalize(selectedDomain);
        const matchesRole = !selectedRole || normalize(m.role) === normalize(selectedRole);
        const matchesStatus = !selectedStatus || normalize(m.status) === normalize(selectedStatus);

        return matchesQuery && matchesDomain && matchesRole && matchesStatus;
    });

    const domains = Array.from(new Set(members.map(m => m.locale_tag).filter(Boolean)))
        .map(tag => ({ code: tag!, name: tag!.toUpperCase() }));

    const roles = Array.from(new Set(members.map(m => m.role).filter(Boolean)))
        .map(role => ({ code: role!, name: role!.charAt(0).toUpperCase() + role!.slice(1) }));

    const statuses = [
        { code: 'active', name: 'Active' },
        { code: 'paused', name: 'Paused' }
    ];

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
                    onClick={() => {
                        setShowAddView(!showAddView);
                        setSelectedIds(new Set());
                    }}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 h-[46px]"
                        />
                    </div>

                    <CustomSelect
                        name="domain"
                        label="Domain"
                        placeholder="All Domains"
                        options={[{ code: '', name: 'All Domains' }, ...domains]}
                        onChange={setSelectedDomain}
                    />

                    <CustomSelect
                        name="role"
                        label="Role"
                        placeholder="All Roles"
                        options={[{ code: '', name: 'All Roles' }, ...roles]}
                        onChange={setSelectedRole}
                    />

                    {!showAddView && (
                        <CustomSelect
                            name="status"
                            label="Status"
                            placeholder="All Status"
                            options={[{ code: '', name: 'All Status' }, ...statuses]}
                            onChange={setSelectedStatus}
                        />
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-muted-foreground">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredMembers.length > 0 && selectedIds.size === filteredMembers.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                    />
                                </th>
                                <th className="p-4">User</th>
                                <th className="p-4">DOMAIN</th>
                                <th className="p-4">Role</th>
                                {!showAddView && <th className="p-4">Status</th>}
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedMembers.map((worker) => (
                                <tr key={worker.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(worker.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(worker.id)}
                                            onChange={() => toggleSelect(worker.id)}
                                            className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                        />
                                    </td>
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden relative">
                                            <img
                                                src={worker.avatar_url || getDefaultAvatar(worker.full_name)}
                                                alt={worker.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{worker.full_name || 'User'}</div>
                                            <div className="text-xs text-muted-foreground">{worker.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium text-muted-foreground uppercase opacity-70">
                                            {worker.locale_tag || '—'}
                                        </span>
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
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
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

            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 backdrop-blur-2xl">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                                <span className="text-primary font-bold">{selectedIds.size}</span>
                                <span className="text-xs text-primary/80 uppercase font-bold tracking-wider">Selected</span>
                            </div>

                            <div className="h-8 w-px bg-white/10" />

                            <div className="flex items-center gap-3">
                                {showAddView ? (
                                    <button
                                        onClick={handleBulkAssign}
                                        disabled={isBulkProcessing}
                                        className="px-4 py-2 bg-primary text-black rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add to Team
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleBulkStatusChange('active')}
                                            disabled={isBulkProcessing}
                                            className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl font-bold flex items-center gap-2 hover:bg-green-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                            Resume
                                        </button>
                                        <button
                                            onClick={() => handleBulkStatusChange('paused')}
                                            disabled={isBulkProcessing}
                                            className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                                            Pause
                                        </button>
                                        <button
                                            onClick={handleBulkRemove}
                                            disabled={isBulkProcessing}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="p-2 text-muted-foreground hover:text-white transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, member: null, isBulk: false })}
                onConfirm={executeRemove}
                title={confirmDelete.isBulk ? 'Remove Selected Members' : 'Remove Team Member'}
                description={confirmDelete.isBulk
                    ? `Are you sure you want to remove ${selectedIds.size} selected members from the project? This action cannot be undone.`
                    : `Are you sure you want to remove ${confirmDelete.member?.full_name || 'this member'} from the project? This action cannot be undone.`
                }
                confirmText={confirmDelete.isBulk ? `Remove ${selectedIds.size} Members` : "Remove Member"}
                type="danger"
                isProcessing={processingId === confirmDelete.member?.id || isBulkProcessing}
            />
        </div>
    );
}
