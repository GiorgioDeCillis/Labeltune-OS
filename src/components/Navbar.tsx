'use client';

import { useTheme } from '@/context/ThemeContext';
import { Bell, User } from 'lucide-react';

export function Navbar({ user }: { user: any }) {
    const { theme } = useTheme();

    return (
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs can go here */}
                <span className="text-sm text-muted-foreground">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.user_metadata?.role || 'User'}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${theme === 'osaka-jade' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-violet-500/50 bg-violet-500/10'
                        }`}>
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
