'use client';

import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';

export function Navbar({ user }: { user: any }) {
    const { theme } = useTheme();

    return (
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs can go here */}
                <span className="text-sm text-white/50">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                <Link href="/dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-white/5 hover:opacity-80 transition-opacity group">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none text-white">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-xs text-white/50 mt-1 capitalize">{user?.user_metadata?.role || 'User'}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${theme === 'osaka-jade' ? 'border-emerald-500/50 bg-emerald-500/10 group-hover:border-emerald-400' : 'border-[#DB595C]/50 bg-[#DB595C]/10 group-hover:border-[#DB595C]'
                        }`}>
                        <User className="w-5 h-5" />
                    </div>
                </Link>
            </div>
        </header>
    );
}
