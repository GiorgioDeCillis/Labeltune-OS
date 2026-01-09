'use client';

import { useState } from 'react';
import {
    Search,
    User,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    Users as UsersIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardUser {
    id: string;
    email?: string;
    full_name: string;
    avatar_url?: string;
    role: string;
    status: string;
    created_at: string;
    last_sign_in_at?: string;
}

export default function UsersClient({ initialUsers }: { initialUsers: DashboardUser[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users] = useState<DashboardUser[]>(initialUsers);

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <UsersIcon className="w-8 h-8 text-primary" />
                        Users
                    </h1>
                    <p className="text-white/60 mt-1">Monitor and manage all platform users</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Users</p>
                        <h3 className="text-2xl font-bold text-white">{users.length}</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Users</p>
                        <h3 className="text-2xl font-bold text-white">
                            {users.filter(u => u.status === 'Active').length}
                        </h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Incomplete Reg.</p>
                        <h3 className="text-2xl font-bold text-white">
                            {users.filter(u => u.status !== 'Active').length}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Last Sign In</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/users/${user.id}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-white/40" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                        {user.full_name}
                                                    </span>
                                                    <span className="text-xs text-white/40 font-mono">
                                                        {user.email || 'No email'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-white/60">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-white/60">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-white/40" />
                                                {formatDate(user.last_sign_in_at)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <UsersIcon className="w-8 h-8 text-white/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-white font-bold">No users found</p>
                                                <p className="text-sm text-white/40">Try adjusting your search terms.</p>
                                            </div>
                                        </div>
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

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        admin: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        pm: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        reviewer: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
        annotator: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        client: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        user: 'bg-white/5 border-white/10 text-white/40' // Fallback for undefined roles
    };

    const style = styles[role] || styles.user;

    return (
        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${style} flex items-center gap-1.5 w-fit`}>
            {role === 'admin' && <Shield className="w-3 h-3" />}
            {role || 'Unknown'}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    let styles = '';
    let icon = null;

    switch (status) {
        case 'Active':
            styles = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            icon = <CheckCircle className="w-3 h-3" />;
            break;
        case 'Pending':
            styles = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
            icon = <Clock className="w-3 h-3" />;
            break;
        case 'Incomplete Registration':
            styles = 'bg-red-500/10 border-red-500/20 text-red-400';
            icon = <AlertCircle className="w-3 h-3" />;
            break;
        default:
            styles = 'bg-white/5 border-white/10 text-white/40';
            icon = <User className="w-3 h-3" />;
    }

    return (
        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${styles}`}>
            {icon}
            {status}
        </span>
    );
}
