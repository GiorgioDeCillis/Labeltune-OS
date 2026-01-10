'use client';

import { useState, useEffect } from 'react';
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
    Search,
    Menu,
    X,
    User,
    FileText,
    Bot,
    Users
} from 'lucide-react';

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const { theme } = useTheme();

    const normalizedRole = userRole?.toLowerCase() || 'annotator';

    const commonLinks = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ];

    const pmLinks = [
        { href: '/dashboard/projects', label: 'Projects', icon: FolderPlus },
        { href: '/dashboard/datasets', label: 'Dataset Explorer', icon: Search },
        { href: '/dashboard/knowledge', label: 'Knowledge', icon: FileText },
        { href: '/dashboard/advisor', label: 'AI Advisor', icon: Bot },
        { href: '/dashboard/users', label: 'Users', icon: Users },
    ];

    const reviewLinks: { href: string; label: string; icon: any }[] = [];

    const workerLinks = [
        { href: '/dashboard/history', label: 'History', icon: CheckCircle },
    ];

    const clientLinks = [
        { href: '/dashboard/client', label: 'Enterprise Overview', icon: LayoutDashboard },
        { href: '/dashboard/projects', label: 'Projects', icon: FolderPlus },
    ];

    // Annotators should ONLY see Overview, possibly My Tasks/History, and Profile.
    // They should NOT see Projects, Dataset Explorer, Courses, Review Queue.
    const isAnnotator = normalizedRole === 'annotator';
    const isReviewer = normalizedRole === 'reviewer';
    const isPM = normalizedRole === 'pm';
    const isAdmin = normalizedRole === 'admin';
    const isClient = normalizedRole === 'client';

    const links = [
        ...(isClient ? clientLinks : commonLinks),
        ...((isPM || isAdmin) ? pmLinks : []),
        ...((isAnnotator) ? [{ href: '/dashboard/advisor', label: 'AI Advisor', icon: Bot }] : []),
        ...((isPM || isAdmin || isReviewer) ? reviewLinks : []),
        ...((isAnnotator || isReviewer || isPM || isAdmin) ? workerLinks : []),
        { href: '/dashboard/profile', label: 'Profile', icon: User },
    ];

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/80 border border-white/20 rounded-lg text-white backdrop-blur-md"
            >
                {isMobileOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`
                w-64 flex flex-col h-screen fixed left-0 top-0 glass-panel border-r border-white/10 z-60 transition-transform duration-300
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 pt-16 md:pt-6">
                    <h1 className="text-xl font-bold tracking-tight">Labeltune OS</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                        {userRole || 'Guest'} Workspace
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = link.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(link.href);

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
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${theme === 'osaka-jade' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : theme === 'purple-moon' ? 'bg-[#A949D9] shadow-[0_0_10px_rgba(169,73,217,0.5)]' : 'bg-[#DB595C] shadow-[0_0_10px_rgba(219,89,92,0.5)]'
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
        </>
    );
}
