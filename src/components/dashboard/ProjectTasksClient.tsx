'use client';

import { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Archive,
    ExternalLink,
    Clock,
    DollarSign,
    Star,
    CheckCircle2,
    Timer,
    AlertCircle,
    User
} from 'lucide-react';
import { Task } from '@/types/manual-types';
import { archiveTask } from '@/app/dashboard/tasks/actions';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';

interface ProjectTasksClientProps {
    initialTasks: any[];
    projectId: string;
    payRate: number;
    error?: any;
}

export function ProjectTasksClient({ initialTasks, projectId, payRate, error }: ProjectTasksClientProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.annotator?.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus && !task.is_archived;
    });

    const handleArchive = async (taskId: string) => {
        if (!confirm('Are you sure you want to archive this task? It will be removed from the active queue.')) return;

        try {
            await archiveTask(projectId, taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_archived: true } : t));
        } catch (error) {
            console.error('Error archiving task:', error);
            alert('Failed to archive task');
        }
    };

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds) return '-';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const exportCSV = () => {
        const headers = ['Task ID', 'Created', 'Status', 'Annotator', 'Annotator Time', 'Annotator Earnings', 'Reviewer', 'Reviewer Time', 'Reviewer Earnings', 'Rating'];
        const csvData = filteredTasks.map(task => [
            task.id,
            new Date(task.created_at).toLocaleString(),
            task.status,
            task.annotator?.full_name || 'N/A',
            task.annotator_time_spent || 0,
            task.annotator_earnings || 0,
            task.reviewer?.full_name || 'N/A',
            task.reviewer_time_spent || 0,
            task.reviewer_earnings || 0,
            task.review_rating || 'N/A'
        ]);

        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `project_tasks_${projectId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">Query Error</p>
                        <p className="text-xs opacity-80">{error.message || JSON.stringify(error)}</p>
                        {error.hint && <p className="text-xs mt-1 italic">Hint: {error.hint}</p>}
                        {error.details && <p className="text-xs mt-1">Details: {error.details}</p>}
                    </div>
                </div>
            )}
            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel !overflow-visible p-4 rounded-xl">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by ID or Annotator..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            name="status_filter"
                            label=""
                            placeholder="All Statuses"
                            options={[
                                { code: 'all', name: 'All Statuses' },
                                { code: 'pending', name: 'Pending' },
                                { code: 'in_progress', name: 'In Progress' },
                                { code: 'completed', name: 'Completed' },
                                { code: 'approved', name: 'Approved' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Task Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="px-6 py-4">Task ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Annotator</th>
                                <th className="px-6 py-4">Reviewer</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No tasks found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm text-foreground">#{task.id.slice(0, 8)}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.annotator ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20 overflow-hidden">
                                                        {task.annotator.avatar_url ? (
                                                            <img src={task.annotator.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            task.annotator.full_name?.[0] || <User className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{task.annotator.full_name}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                <Timer className="w-3 h-3 text-primary/50" />
                                                                {formatTime(task.annotator_time_spent)}
                                                            </span>
                                                            <span className="text-[10px] text-green-500/80 font-bold flex items-center gap-0.5">
                                                                <DollarSign className="w-3 h-3" />
                                                                {task.annotator_earnings?.toFixed(2) || '0.00'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.reviewer ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-xs font-bold border border-yellow-500/20 overflow-hidden">
                                                        {task.reviewer.avatar_url ? (
                                                            <img src={task.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            task.reviewer.full_name?.[0] || <User className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{task.reviewer.full_name}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                <Timer className="w-3 h-3 text-yellow-500/50" />
                                                                {formatTime(task.reviewer_time_spent)}
                                                            </span>
                                                            <span className="text-[10px] text-green-500/80 font-bold flex items-center gap-0.5">
                                                                <DollarSign className="w-3 h-3" />
                                                                {task.reviewer_earnings?.toFixed(2) || '0.00'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.review_rating ? (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                    <span className="text-sm font-bold text-yellow-500">{task.review_rating.toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {task.status === 'completed' && (
                                                    <Link href={`/dashboard/review/${task.id}`}>
                                                        <button className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-all" title="Review Task">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleArchive(task.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                                                    title="Archive Task"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-white/5 text-muted-foreground border-white/10',
        in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        completed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    const icons: Record<string, any> = {
        pending: Clock,
        in_progress: Timer,
        completed: AlertCircle,
        approved: CheckCircle2,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            <Icon className="w-3 h-3" />
            {status.replace('_', ' ')}
        </span>
    );
}
