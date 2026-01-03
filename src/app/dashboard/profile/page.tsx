'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Mail, Shield, Zap, Palette, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
    const { theme, setTheme, wallpaper, setWallpaper } = useTheme();
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const wallpaperOptions = {
        'osaka-jade': ['1', '2', '3'].map(n => ({
            url: `/themes/osaka-jade/${n}-osaka-jade-bg.jpg`,
            id: `${n}-osaka-jade-bg`
        })),
        'ayaka': ['b2', 'b8'].map(n => ({
            url: `/themes/ayaka/${n}.jpg`,
            id: n
        })),
        'purple-moon': ['BG09', 'mythical-dragon-beast-anime-style', 'CC05'].map(n => ({
            url: `/themes/purple-moon/${n}.jpg`,
            id: n
        }))
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${theme === 'osaka-jade' ? 'border-emerald-500/30 bg-emerald-500/10' : theme === 'purple-moon' ? 'border-[#A949D9]/30 bg-[#A949D9]/10' : 'border-[#DB595C]/30 bg-[#DB595C]/10'
                    } relative z-10 shadow-2xl`}>
                    <User className="w-16 h-16 text-primary" />
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
                    <h2 className="text-3xl font-black tracking-tight">
                        {user?.user_metadata?.full_name || 'User Profile'}
                    </h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{user?.email || 'loading...'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-wider">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-bold">{user?.user_metadata?.role || 'Annotator'}</span>
                        </div>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Theme Selection */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 rounded-3xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Palette className="text-primary w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Theme Strategy</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <ThemeButton
                            active={theme === 'osaka-jade'}
                            onClick={() => setTheme('osaka-jade')}
                            title="Osaka Jade"
                            desc="Industrial emerald and deep charcoal"
                            color="bg-emerald-500"
                        />
                        <ThemeButton
                            active={theme === 'ayaka'}
                            onClick={() => setTheme('ayaka')}
                            title="Ayaka"
                            desc="Elegant coral and misty quartz"
                            color="bg-[#DB595C]"
                        />
                        <ThemeButton
                            active={theme === 'purple-moon'}
                            onClick={() => setTheme('purple-moon')}
                            title="Purple Moon"
                            desc="Enchanting violet and cosmic dust"
                            color="bg-[#A949D9]"
                        />
                    </div>
                </motion.section>

                {/* Wallpaper Selection */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 rounded-3xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="text-primary w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Background</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {(theme === 'osaka-jade' ? wallpaperOptions['osaka-jade'] : theme === 'purple-moon' ? wallpaperOptions['purple-moon'] : wallpaperOptions['ayaka']).map((wp) => (
                            <button
                                key={wp.id}
                                onClick={() => setWallpaper(wp.url)}
                                className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all group ${wallpaper.includes(wp.id) ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={wp.url}
                                    alt="Wallpaper"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                />
                                {wallpaper.includes(wp.id) && (
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-primary-foreground fill-primary" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

function ThemeButton({ active, onClick, title, desc, color }: {
    active: boolean,
    onClick: () => void,
    title: string,
    desc: string,
    color: string
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${active ? 'border-primary bg-primary/5' : 'border-white/5 hover:bg-white/5'
                }`}
        >
            <div className={`w-10 h-10 rounded-lg ${color} shadow-lg shadow-black/20`} />
            <div>
                <h4 className="font-bold">{title}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            {active && (
                <div className="ml-auto w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                </div>
            )}
        </button>
    );
}
