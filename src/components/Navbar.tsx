'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { Bell, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getDefaultAvatar } from '@/utils/avatar';

export function Navbar({ user, userRole, initialAvatar, fullName }: { user: any, userRole?: string, initialAvatar?: string | null, fullName?: string | null }) {
    const { theme, avatarUrl, setAvatarUrl } = useTheme();
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        if (initialAvatar && !avatarUrl) {
            setAvatarUrl(initialAvatar);
        }
    }, [initialAvatar, avatarUrl, setAvatarUrl]);

    return (
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs can go here */}
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                <Link href="/dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-white/5 hover:opacity-80 transition-opacity group">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none text-white">{fullName || user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-xs text-white/50 mt-1 capitalize">{userRole || user?.user_metadata?.role || 'User'}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all relative overflow-hidden ${theme === 'osaka-jade' ? 'border-emerald-500/50 bg-emerald-500/10 group-hover:border-emerald-400' : theme === 'purple-moon' ? 'border-[#A949D9]/50 bg-[#A949D9]/10 group-hover:border-[#A949D9]' : 'border-[#DB595C]/50 bg-[#DB595C]/10 group-hover:border-[#DB595C]'
                        }`}>
                        {(avatarUrl || initialAvatar) && !avatarError ? (
                            <Image
                                src={avatarUrl || initialAvatar!}
                                alt="Profile Avatar"
                                fill
                                className="object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <Image
                                src={getDefaultAvatar(fullName || user?.user_metadata?.full_name)}
                                alt="Default Avatar"
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
