'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import {
    LayoutDashboard,
    FolderPlus,
    ListTodo,
    CheckCircle,
    Settings,
    LogOut,
    GraduationCap,
    Search
} from 'lucide-react';

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const { theme } = useTheme();

    const commonLinks = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ];

    const pmLinks = [
        { href: '/dashboard/projects', label: 'Projects', icon: FolderPlus },
        { href: '/dashboard/datasets', label: 'Dataset Explorer', icon: Search },
        { href: '/dashboard/courses', label: 'Courses', icon: GraduationCap },
    ];

    const reviewLinks = [
        { href: '/dashboard/review', label: 'Review Queue', icon: CheckCircle },
    ];

    const workerLinks = [
        { href: '/dashboard/tasks', label: 'My Tasks', icon: ListTodo },
        { href: '/dashboard/history', label: 'History', icon: CheckCircle },
    ];

    const clientLinks = [
        { href: '/dashboard/client', label: 'Enterprise Overview', icon: LayoutDashboard },
        { href: '/dashboard/projects', label: 'Projects', icon: FolderPlus },
    ];

    const links = [
        ...(userRole === 'client' ? clientLinks : commonLinks),
        ...(userRole === 'pm' || userRole === 'admin' ? pmLinks : []),
        ...(userRole === 'pm' || userRole === 'admin' || userRole === 'reviewer' ? reviewLinks : []),
        ...(userRole === 'annotator' || userRole === 'reviewer' ? workerLinks : []),
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 glass-panel border-r border-white/10 z-50">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight">Labeltune OS</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                    {userRole || 'Guest'} Workspace
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${theme === 'osaka-jade' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                                    }`} />
                            )}
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <form action="/auth/signout" method="post">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
}
