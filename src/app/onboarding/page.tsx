'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Globe, MapPin, FileText,
    CheckCircle2, AlertCircle, Loader2, Info, LogOut,
    Linkedin, Github, ExternalLink, CreditCard
} from 'lucide-react';
import { submitOnboarding } from './actions';
import { useTheme } from '@/context/ThemeContext';

const COUNTRIES = [
    { code: 'IT', name: 'Italia' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CH', name: 'Svizzera' },
    { code: 'FR', name: 'Francia' },
    { code: 'DE', name: 'Germania' },
    { code: 'ES', name: 'Spagna' },
];

const LANGUAGES = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
];

export default function OnboardingPage() {
    const { theme } = useTheme();
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            await submitOnboarding(formData);
        } catch (err: any) {
            setError(err.message || 'Qualcosa è andato storto. Riprova.');
            setIsPending(false);
        }
    }

    return (
    return (
        <div className="h-screen overflow-hidden flex flex-col">
            {/* Background elements - fixed to viewport - Aligned with Login aesthetic */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full opacity-30" />
                <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full opacity-30" />
            </div>

            {/* Header with Sign Out - Standardized like Navbar */}
            <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-end px-8 relative z-20">
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </form>
            </header>

            {/* Scrollable container - Matching Dashboard EXACTLY */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw] overflow-x-hidden relative z-10">
                <div className="max-w-4xl mx-auto py-12 md:py-20 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Benvenuto su Labeltune!</h1>
                        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                            Completa il tuo profilo per iniziare a lavorare come Annotator sulla nostra piattaforma.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-panel p-6 md:p-8 rounded-3xl space-y-6"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    Informazioni Personali
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-60">Nome</label>
                                        <input
                                            name="firstName"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Mario"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-60">Cognome</label>
                                        <input
                                            name="lastName"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Rossi"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Data di Nascita</label>
                                    <input
                                        name="birthDate"
                                        type="date"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Numero di Telefono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            name="phoneNumber"
                                            type="tel"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="+39 333 1234567"
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* Location & Language */}
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-panel p-6 md:p-8 rounded-3xl space-y-6"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="w-5 h-5 text-primary" />
                                    </div>
                                    Nazionalità e Lingua
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Nazionalità</label>
                                    <select
                                        name="nationality"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled selected>Seleziona nazionalità</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code} className="bg-[#1a1c1e]">{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Lingua Principale</label>
                                    <select
                                        name="primaryLanguage"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled selected>Seleziona lingua</option>
                                        {LANGUAGES.map(l => (
                                            <option key={l.code} value={l.code} className="bg-[#1a1c1e]">{l.name}</option>
                                        ))}
                                    </select>
                                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex gap-3">
                                        <Info className="w-5 h-5 text-primary flex-shrink-0" />
                                        <p className="text-[11px] leading-relaxed">
                                            Questa rappresenta la lingua con cui farai le task. Assicurati di avere un livello <strong>madre lingua</strong> per la lingua inserita.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Indirizzo</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            name="address"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Via Roma 1, Milano"
                                        />
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Professional info */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-panel p-6 md:p-8 rounded-3xl space-y-6"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    Profilo Professionale
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-60">Carica CV (PDF)</label>
                                    <div className="relative group/file">
                                        <input
                                            name="cv"
                                            type="file"
                                            accept=".pdf"
                                            required
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                console.log("File selected:", file?.name);
                                                setCvFile(file);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all text-center ${cvFile ? 'bg-primary/5 border-primary/50' : 'bg-white/5 border-white/10 group-hover/file:border-primary/50 group-hover/file:bg-primary/5'
                                            }`}>
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover/file:scale-110 transition-transform">
                                                {cvFile ? (
                                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                                ) : (
                                                    <FileText className="w-6 h-6 opacity-40 group-hover/file:text-primary group-hover/file:opacity-100" />
                                                )}
                                            </div>
                                            <span className="text-sm font-bold block truncate max-w-xs mx-auto">
                                                {cvFile ? cvFile.name : "Clicca o trascina il tuo CV"}
                                            </span>
                                            <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">
                                                {cvFile ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : "Solo formati PDF"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="relative">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            name="linkedinUrl"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Profilo LinkedIn (opzionale)"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            name="githubUrl"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Profilo GitHub (opzionale)"
                                        />
                                    </div>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        <input
                                            name="websiteUrl"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Sito Web (opzionale)"
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* Payment info */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-panel p-6 md:p-8 rounded-3xl space-y-6"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    Pagamenti & Consensi
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-60">Email PayPal</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                            <input
                                                name="paypalEmail"
                                                type="email"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                placeholder="mario.rossi@example.com"
                                            />
                                        </div>
                                        <p className="text-[10px] opacity-40">Necessaria per ricevere i compensi.</p>
                                    </div>

                                    <div className="pt-4 space-y-4">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative flex-shrink-0 mt-1">
                                                <input
                                                    name="jobOffersConsent"
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                />
                                                <div className="w-6 h-6 border-2 border-white/10 rounded-lg group-hover:border-primary/50 transition-all peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">Ricevi offerte da partner</span>
                                                <p className="text-xs opacity-40 leading-relaxed">Acconsento a ricevere offerte di lavoro anche da aziende partner di Labeltune.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-8"
                        >
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Completa Registrazione
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                                        </motion.div>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>
                </div>
            </main>
        </div>
    );
}
