'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { User, Mail, Shield, Zap, Palette, Image as ImageIcon, Sparkles, Camera, Loader2, Copy, Check, FileText, ExternalLink, Phone, MapPin, CreditCard, Github, Linkedin, Smartphone, Briefcase, Lock, Key, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDefaultAvatar } from '@/utils/avatar';
import { updateProfile, updatePassword } from './actions';
import CustomSelect from '@/components/CustomSelect';
import CustomDateInput from '@/components/CustomDateInput';

export default function ProfilePage() {
    const {
        theme, setTheme, wallpaper, setWallpaper,
        blur, setBlur, transparency, setTransparency,
        avatarUrl, setAvatarUrl
    } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [copied, setCopied] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

            // Add cache busting timestamp for immediate UI update
            const publicUrlWithCacheBurst = `${publicUrl}?t=${Date.now()}`;

            setProfile({ ...profile, avatar_url: publicUrlWithCacheBurst });
            setAvatarUrl(publicUrlWithCacheBurst);
            setAvatarError(false); // Reset error state on successful upload
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

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        try {
            await updateProfile(formData);
            setSuccess('Profilo aggiornato con successo');
            setIsEditing(false);

            // Refresh local state
            const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(updatedProfile);
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'aggiornamento');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        const formData = new FormData(e.currentTarget);
        try {
            await updatePassword(formData);
            setPasswordSuccess('Password aggiornata con successo');
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setPasswordError(err.message || 'Errore durante l\'aggiornamento della password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const wallpaperOptions = {
        'osaka-jade': ['1', '2', '3'].map(n => ({
            url: `/themes/osaka-jade/${n}-osaka-jade-bg.jpg`,
            id: `${n}-osaka-jade-bg`
        })),
        'ayaka': ['b2', 'b6', 'b8'].map(n => ({
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
                        {profile?.avatar_url && !avatarError ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <Image
                                src={getDefaultAvatar(profile?.full_name || user?.user_metadata?.full_name)}
                                alt="Default Avatar"
                                fill
                                className="object-cover"
                            />
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

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* User Info Section */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="text-primary w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold">Dati Personali</h3>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isEditing ? 'bg-white/10 hover:bg-white/20' : 'bg-primary/20 text-primary hover:bg-primary/30'
                                }`}
                        >
                            {isEditing ? 'Annulla' : 'Modifica'}
                        </button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="edit-fields"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Nome</label>
                                            <input
                                                name="firstName"
                                                defaultValue={profile?.first_name}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Cognome</label>
                                            <input
                                                name="lastName"
                                                defaultValue={profile?.last_name}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Data di Nascita</label>
                                        <CustomDateInput
                                            name="birthDate"
                                            defaultValue={profile?.birth_date}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Telefono</label>
                                        <input
                                            name="phoneNumber"
                                            defaultValue={profile?.phone_number}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Indirizzo</label>
                                        <input
                                            name="address"
                                            defaultValue={profile?.address}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Email PayPal</label>
                                        <input
                                            name="paypalEmail"
                                            defaultValue={profile?.paypal_email}
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1 block border-b border-white/5 pb-1">Social & Web</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                            <input
                                                name="linkedinUrl"
                                                defaultValue={profile?.linkedin_url}
                                                placeholder="LinkedIn URL"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                            <input
                                                name="githubUrl"
                                                defaultValue={profile?.github_url}
                                                placeholder="GitHub URL"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                            <input
                                                name="websiteUrl"
                                                defaultValue={profile?.website_url}
                                                placeholder="Portfolio / Website URL"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex-shrink-0">
                                                <input
                                                    name="jobOffersConsent"
                                                    type="checkbox"
                                                    defaultChecked={profile?.job_offers_consent}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 border-2 border-white/10 rounded-lg group-hover:border-primary/50 transition-all peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold opacity-80">Offerte partner</span>
                                                <span className="text-[10px] opacity-40">Acconsento a ricevere offerte di lavoro dai partner</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            Salva Modifiche
                                        </button>
                                    </div>

                                    {error && (
                                        <p className="text-xs text-red-500 font-bold text-center animate-pulse">{error}</p>
                                    )}
                                    {success && (
                                        <p className="text-xs text-emerald-500 font-bold text-center">{success}</p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view-fields"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 gap-4 text-sm"
                                >
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="opacity-60">Nome Completo</span>
                                        <span className="font-bold">{profile?.full_name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="opacity-60">Telefono</span>
                                        <span className="font-bold">{profile?.phone_number || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5 group">
                                        <span className="opacity-60">Nazionalità</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold uppercase">{profile?.nationality || '-'}</span>
                                            <Lock className="w-3 h-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5 group">
                                        <span className="opacity-60">Lingua (Tag)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold px-2 py-0.5 bg-primary/20 rounded-md text-primary">{profile?.locale_tag || '-'}</span>
                                            <Lock className="w-3 h-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                                        </div>
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
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all font-bold mt-2 group"
                                        >
                                            <FileText className="w-4 h-4 text-primary" />
                                            Visualizza CV
                                            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-3 h-3" />
                                                <Lock className="w-3 h-3 ml-1 opacity-20" />
                                            </div>
                                        </a>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.section>

                {/* Change Password Section */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 rounded-3xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Key className="text-primary w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Sicurezza</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Nuova Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                <input
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 pl-1">Conferma Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                            Aggiorna Password
                        </button>

                        {passwordError && (
                            <p className="text-[10px] text-red-500 font-bold text-center flex items-center justify-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {passwordError}
                            </p>
                        )}
                        {passwordSuccess && (
                            <p className="text-[10px] text-emerald-500 font-bold text-center flex items-center justify-center gap-1">
                                <Check className="w-3 h-3" />
                                {passwordSuccess}
                            </p>
                        )}
                    </form>
                </motion.section>
            </div>

            {/* Appearance Settings */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-8 rounded-3xl space-y-10"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Palette className="text-primary w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Impostazioni di Aspetto</h3>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40 pl-1">Tema Piattaforma</label>
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
                    </div>

                    {/* Glass Effects */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="font-bold text-sm uppercase tracking-wider opacity-60">Sfocatura Sfondo</label>
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
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="font-bold text-sm uppercase tracking-wider opacity-60">Trasparenza Vetro</label>
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
                        </div>
                    </div>
                </div>

                {/* Wallpaper Selection */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 pl-1">Sfondo Desktop</label>
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
