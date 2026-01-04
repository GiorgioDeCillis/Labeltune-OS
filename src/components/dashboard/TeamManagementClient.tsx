'use client';

import { useState } from 'react';
import { User, CheckCircle, XCircle, Trash2, Plus, Search } from 'lucide-react';
import { assignUserToProject, removeUserFromProject } from '@/app/dashboard/projects/actions';
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
    isAssigned: boolean;
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

    const toggleAssignment = async (member: TeamMember) => {
        if (processingId) return;

        setProcessingId(member.id);
        try {
            if (member.isAssigned) {
                // Remove
                if (!confirm('Are you sure you want to remove this member?')) {
                    setProcessingId(null);
                    return;
                }
                await removeUserFromProject(projectId, member.id);
                showToast('Member removed', 'success');
                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAssigned: false } : m));
            } else {
                // Add
                await assignUserToProject(projectId, member.id);
                showToast('Member added', 'success');
                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAssigned: true } : m));
            }
        } catch (error) {
            console.error('Failed to update assignment:', error);
            showToast('Failed to update assignment', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const normalize = (str?: string) => (str || '').toLowerCase();

    const filteredMembers = members.filter(m => {
        const matchesQuery =
            normalize(m.full_name).includes(normalize(filterQuery)) ||
            normalize(m.email).includes(normalize(filterQuery));

        const matchesTag = !tagFilter || m.tags?.some(tag => normalize(tag).includes(normalize(tagFilter)));

        return matchesQuery && matchesTag;
    });

    // Sort: Assigned first, then by name
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (a.isAssigned === b.isAssigned) {
            return (a.full_name || '').localeCompare(b.full_name || '');
        }
        return a.isAssigned ? -1 : 1;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Project Workers</h2>
                    <p className="text-muted-foreground">Manage annotators and verify qualifications.</p>
                </div>
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
                                <th className="p-4">Assignment</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedMembers.map((worker) => (
                                <tr key={worker.id} className={`hover:bg-white/5 transition-colors ${worker.isAssigned ? 'bg-primary/5' : ''}`}>
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
                                    <td className="p-4">
                                        {worker.isAssigned ? (
                                            <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Assigned
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground font-bold text-xs">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => toggleAssignment(worker)}
                                            disabled={processingId === worker.id}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ml-auto disabled:opacity-50 ${worker.isAssigned
                                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                }`}
                                        >
                                            {processingId === worker.id ? 'Updating...' : (
                                                worker.isAssigned ? (
                                                    <><Trash2 className="w-3 h-3" /> Remove</>
                                                ) : (
                                                    <><Plus className="w-3 h-3" /> Add to Team</>
                                                )
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sortedMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                                        No users found matching your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
