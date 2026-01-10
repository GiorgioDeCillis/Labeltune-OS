'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Shield, Calendar, Clock, MapPin, Smartphone,
    FileText, Activity, DollarSign, Star, Briefcase,
    CheckCircle2, AlertCircle, Loader2, Edit2, Save, X,
    LayoutGrid, List, File, BookOpen, Trophy
} from 'lucide-react';
import Image from 'next/image';
import { getDefaultAvatar } from '@/utils/avatar';
import { updateUserProfile } from './actions';

interface UserProfileClientProps {
    initialData: {
        authUser: any;
        profile: any;
        stats: any;
        recentActivity: any[];
        accessLogs: any[];
        courseProgress?: any[];
    };
    userId: string;
}

export default function UserProfileClient({ initialData, userId }: UserProfileClientProps) {
    const { authUser, profile, stats, recentActivity, accessLogs, courseProgress = [] } = initialData;
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        birth_date: profile.birth_date || '',
        paypal_email: profile.paypal_email || '',
        nationality: profile.nationality || '',
        primary_language: profile.primary_language || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        website_url: profile.website_url || '',
        role: profile.role || 'user'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            await updateUserProfile(userId, data);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
            // In a real app we might want to refresh data here or use optimistic updates
            // For now rely on server action revalidation
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'activity', label: 'Activity & Logs', icon: Activity },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl relative overflow-hidden"
            >
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-full border-4 border-white/10 relative overflow-hidden shadow-2xl">
                            <Image
                                src={profile.avatar_url || getDefaultAvatar(profile.full_name)}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{profile.full_name || 'Unknown User'}</h1>
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {authUser.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${profile.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                    profile.role === 'pm' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {profile.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${profile.is_onboarded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {profile.is_onboarded ? 'Active' : 'Pending Reg.'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Earnings</p>
                                <p className="text-2xl font-black text-emerald-400">€{stats.totalEarnings.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Tasks Completed</p>
                                <p className="text-2xl font-black">{stats.completedTasksCount}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Avg Rating</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black">{stats.avgRating.toFixed(1)}</p>
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Joined</p>
                                <p className="text-lg font-bold">{new Date(authUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-blue-400">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            )}
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                            )}
                            {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            </motion.div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'hover:bg-white/5 text-muted-foreground hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {/* Profile Details Form */}
                        <div className="glass-panel p-8 rounded-3xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </h3>
                                <button
                                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                >
                                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold opacity-60 uppercase tracking-wider">First Name</label>
                                        <input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Last Name</label>
                                        <input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Phone</label>
                                    <input
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Nationality</label>
                                    <input
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Primary Language</label>
                                    <input
                                        name="primary_language"
                                        value={formData.primary_language}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold opacity-60 uppercase tracking-wider">LinkedIn URL</label>
                                        <input
                                            name="linkedin_url"
                                            value={formData.linkedin_url}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="https://linkedin.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold opacity-60 uppercase tracking-wider">GitHub URL</label>
                                        <input
                                            name="github_url"
                                            value={formData.github_url}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="https://github.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Website URL</label>
                                        <input
                                            name="website_url"
                                            value={formData.website_url}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="https://mysite.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">PayPal Email</label>
                                    <input
                                        name="paypal_email"
                                        value={formData.paypal_email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Address</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary disabled:opacity-50"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="pt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                                        {success && <p className="text-emerald-500 text-sm mt-2 text-center">{success}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="space-y-6">
                            <div className="glass-panel p-8 rounded-3xl space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    System & Role
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-sm font-medium">User ID</span>
                                        <code className="text-xs font-mono bg-black/20 px-2 py-1 rounded select-all">{userId}</code>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-sm font-medium">Role</span>
                                        {isEditing ? (
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs font-bold uppercase outline-none focus:border-primary"
                                            >
                                                <option value="annotator">Annotator</option>
                                                <option value="pm">Project Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className="text-xs font-bold uppercase">{profile.role}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-sm font-medium">Last Sign In</span>
                                        <span className="text-xs text-muted-foreground">
                                            {authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-sm font-medium">Created At</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(authUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
                }

                {
                    activeTab === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-panel p-8 rounded-3xl"
                        >
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-primary" />
                                Recent Tasks Activity
                            </h3>

                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((task: any) => (
                                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${task.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    task.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                    {task.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> :
                                                        task.status === 'rejected' ? <AlertCircle className="w-4 h-4" /> :
                                                            <Clock className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Task #{task.id.slice(0, 8)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(() => {
                                                            const date = new Date(task.created_at);
                                                            const now = new Date();
                                                            const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

                                                            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

                                                            if (diff < 60) return rtf.format(-diff, 'second');
                                                            if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
                                                            if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
                                                            if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), 'day');
                                                            if (diff < 31536000) return rtf.format(-Math.floor(diff / 2592000), 'month');
                                                            return rtf.format(-Math.floor(diff / 31536000), 'year');
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold text-sm">
                                                    {task.annotator_earnings ? `€${task.annotator_earnings.toFixed(2)}` : '-'}
                                                </p>
                                                <p className="text-[10px] uppercase font-bold opacity-60">{task.status}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No recent activity found.</p>
                                )}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    System Access Logs
                                </h3>
                                <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                                    {accessLogs && accessLogs.length > 0 ? (
                                        <div className="divide-y divide-white/5">
                                            {accessLogs.map((log: any) => (
                                                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                                            {log.user_agent?.includes('Mobile') ? (
                                                                <Smartphone className="w-5 h-5 text-blue-400" />
                                                            ) : (
                                                                <MapPin className="w-5 h-5 text-blue-400" />
                                                            )}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-sm truncate max-w-[200px] sm:max-w-md" title={log.user_agent}>
                                                                {log.user_agent ? (log.user_agent.length > 40 ? log.user_agent.substring(0, 40) + '...' : log.user_agent) : 'Unknown Device'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Session ID: {log.id.slice(0, 8)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-4">
                                                        <p className="font-mono text-sm font-bold text-primary">
                                                            {log.ip_address ? log.ip_address.split('/')[0] : 'IP Not Available'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No access logs available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === 'projects' && (
                        <motion.div
                            key="projects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="glass-panel p-8 rounded-3xl">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Assigned Projects
                                </h3>

                                <div className="grid gap-6">
                                    {stats.projectStats && stats.projectStats.length > 0 ? (
                                        stats.projectStats.map((p: any) => (
                                            <div key={p.projectId} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xl font-black">{p.projectName}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${p.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {p.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">{p.projectType}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1 max-w-2xl">
                                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Avg Time / Task</p>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-primary" />
                                                                <p className="text-lg font-black">
                                                                    {(() => {
                                                                        const sec = Math.round(p.avgTimeSpent);
                                                                        if (sec < 60) return `${sec}s`;
                                                                        const min = Math.floor(sec / 60);
                                                                        const remSec = sec % 60;
                                                                        return `${min}m ${remSec}s`;
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Tasks Completed</p>
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                                <p className="text-lg font-black">{p.completedTasks}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Earnings</p>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                                                <p className="text-lg font-black text-emerald-400">€{p.totalEarnings.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                                            <p className="text-muted-foreground">No projects assigned to this user.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === 'courses' && (
                        <motion.div
                            key="courses"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="glass-panel p-8 rounded-3xl">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    Educational Progress
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {courseProgress && courseProgress.length > 0 ? (
                                        courseProgress.map((cp: any) => (
                                            <div key={cp.id} className={`p-6 rounded-2xl border transition-all ${cp.status === 'completed'
                                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-lg">{cp.course?.title}</h4>
                                                        <p className="text-xs text-muted-foreground">Course ID: {cp.course_id.slice(0, 8)}</p>
                                                    </div>
                                                    <div className={`p-2 rounded-xl ${cp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                                                        }`}>
                                                        {cp.status === 'completed' ? <Trophy className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                </div>

                                                <div className="mt-6 space-y-3">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                                                        <span className={`font-black uppercase tracking-widest ${cp.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'
                                                            }`}>
                                                            {cp.status === 'completed' ? 'SUCCESS' : cp.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Lessons Completed</span>
                                                        <span className="font-mono">{cp.completed_lessons?.length || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Last Activity</span>
                                                        <span className="text-white/60">{new Date(cp.updated_at).toLocaleDateString('en-GB')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-2xl">
                                            <p className="text-muted-foreground">This user has not started any courses.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === 'documents' && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-panel p-8 rounded-3xl"
                        >
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <FileText className="w-5 h-5 text-primary" />
                                Uploaded Documents
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                {profile.cv_url ? (
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-500/10 rounded-xl">
                                                <FileText className="w-6 h-6 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold">Curriculum Vitae</p>
                                                <p className="text-xs text-muted-foreground">PDF Document</p>
                                            </div>
                                        </div>
                                        <a
                                            href={profile.cv_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            View
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No CV uploaded.</p>
                                )}
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
