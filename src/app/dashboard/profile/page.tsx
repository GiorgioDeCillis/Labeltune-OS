'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Mail, Shield, Zap, Palette, Image as ImageIcon, Sparkles, Camera, Loader2, Copy, Check, FileText, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
    const {
        theme, setTheme, wallpaper, setWallpaper,
        blur, setBlur, transparency, setTransparency,
        avatarUrl, setAvatarUrl
    } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile record
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, avatar_url: publicUrl });
            setAvatarUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Errore durante il caricamento dell\'immagine');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCopyId = () => {
        if (!user?.id) return;
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                <div className="relative group">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${theme === 'osaka-jade' ? 'border-emerald-500/30 bg-emerald-500/10' : theme === 'purple-moon' ? 'border-[#A949D9]/30 bg-[#A949D9]/10' : 'border-[#DB595C]/30 bg-[#DB595C]/10'
                        } relative z-10 shadow-2xl overflow-hidden`}>
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-primary" />
                        )}

                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <Camera className="w-8 h-8 text-white" />
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
                    <h2 className="text-3xl font-black tracking-tight">
                        {profile?.full_name || user?.user_metadata?.full_name || 'User Profile'}
                    </h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{user?.email || 'loading...'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-wider">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-bold">{profile?.role || user?.user_metadata?.role || 'annotator'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 group/id transition-all hover:bg-white/10">
                            <span className="text-[10px] font-bold uppercase opacity-40">Labeltune ID</span>
                            <span className="text-sm font-mono opacity-70">{user?.id?.slice(0, 8)}...</span>
                            <button
                                onClick={handleCopyId}
                                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                title="Copy ID"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 opacity-40 group-hover/id:opacity-100 transition-opacity" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* User Info from Onboarding */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 rounded-3xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="text-primary w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Dati Personali</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="opacity-60">Nome Completo</span>
                            <span className="font-bold">{profile?.full_name || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="opacity-60">Telefono</span>
                            <span className="font-bold">{profile?.phone_number || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="opacity-60">Nazionalità</span>
                            <span className="font-bold uppercase">{profile?.nationality || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="opacity-60">Lingua (Tag)</span>
                            <span className="font-bold px-2 py-0.5 bg-primary/20 rounded-md text-primary">{profile?.locale_tag || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="opacity-60">Email PayPal</span>
                            <span className="font-bold">{profile?.paypal_email || '-'}</span>
                        </div>
                        {profile?.cv_url && (
                            <a
                                href={profile.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all font-bold mt-2"
                            >
                                <FileText className="w-4 h-4 text-primary" />
                                Visualizza CV
                                <ExternalLink className="w-3 h-3 opacity-40" />
                            </a>
                        )}
                    </div>
                </motion.section>

                {/* Theme Selection */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
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
            </div>

            {/* Wallpaper Selection & Settings... */}
            <div className="grid md:grid-cols-1 gap-8">
                {/* Wallpaper Selection */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 rounded-3xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="text-primary w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Background</h3>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
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

            {/* Appearance Settings */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6 rounded-3xl space-y-8"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="text-primary w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Advanced Appearance</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-sm uppercase tracking-wider opacity-60">Background Blur</label>
                            <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded text-xs">{blur}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={blur}
                            onChange={(e) => setBlur(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-muted-foreground">Adjust the depth of field for the desktop wallpaper.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-sm uppercase tracking-wider opacity-60">Glass Transparency</label>
                            <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded text-xs">{Math.round(transparency * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.95"
                            step="0.05"
                            value={transparency}
                            onChange={(e) => setTransparency(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-muted-foreground">Regulate the opacity of all interface panels.</p>
                    </div>
                </div>
            </motion.section>
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
