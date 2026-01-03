'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Database, Bot, CheckCircle2, Globe, Cpu, Zap, ArrowRight } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#00020F] text-white selection:bg-blue-500/30 font-sans">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
            </div>

            {/* Floating Navbar */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-8 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
                >
                    <Link href="#" className="font-black text-lg tracking-tighter hover:opacity-80 transition-opacity">
                        Labeltune
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                        <Link href="#metodo" className="hover:text-white transition-colors">Metodo</Link>
                        <Link href="#servizi" className="hover:text-white transition-colors">Servizi</Link>
                        <Link href="#blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>
                    <Link href="/login">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            Accedi
                        </button>
                    </Link>
                </motion.div>
            </nav>

            <main className="relative pt-32 px-6">
                {/* Hero Section */}
                <section className="max-w-5xl mx-auto text-center py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
                            Innovazione Digitale
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
                            Dai dati al <br />
                            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                deployment
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed font-medium">
                            Soluzioni di intelligenza artificiale su misura. Massimizza l'efficienza dei tuoi dati con la piattaforma di labeling più avanzata sul mercato.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/login">
                                <button className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-blue-600/25">
                                    Inizia ora
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
                                Demo Video
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section id="servizi" className="max-w-7xl mx-auto py-32 space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">I nostri servizi</h2>
                        <p className="text-white/60 font-medium">Potenzia il tuo workflow con strumenti all'avanguardia.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Database className="w-6 h-6" />}
                            title="Data Labeling"
                            description="Etichettatura di precisione per Computer Vision e NLP con controllo qualità multi-livello."
                        />
                        <FeatureCard
                            icon={<Bot className="w-6 h-6" />}
                            title="AI Agents"
                            description="Creazione di assistenti virtuali intelligenti integrati nei tuoi processi aziendali."
                        />
                        <FeatureCard
                            icon={<Cpu className="w-6 h-6" />}
                            title="Model Tuning"
                            description="Ottimizzazione di modelli open-source su dataset proprietari."
                        />
                        <FeatureCard
                            icon={<Globe className="w-6 h-6" />}
                            title="Italian Focus"
                            description="Deep expertise sulla lingua e cultura italiana per applicazioni LLM localizzate."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            title="Quality Assurance"
                            description="Pipeline di validazione rigorosa per garantire l'accuratezza del 99.9%."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6" />}
                            title="Scale Ready"
                            description="Infrastruttura cloud scalabile per gestire milioni di annotazioni al giorno."
                        />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-5xl mx-auto pb-40">
                    <div className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-b from-blue-600/20 to-transparent border border-blue-500/20 overflow-hidden text-center">
                        <div className="absolute inset-0 bg-blue-600/5 blur-[80px]" />
                        <div className="relative space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Pronto per il futuro?</h2>
                            <p className="text-white/60 max-w-xl mx-auto font-medium">Unisciti alle aziende che hanno già rivoluzionato il proprio modo di gestire i dati.</p>
                            <Link href="/login">
                                <button className="bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform active:scale-95">
                                    Contattaci ora
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <p className="font-black text-xl tracking-tighter">Labeltune</p>
                        <p className="text-white/30 text-sm font-medium">© 2024 Labeltune OS. Tutti i diritti riservati.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-white/50 font-medium">
                        <Link href="#" className="hover:text-white">Privacy</Link>
                        <Link href="#" className="hover:text-white">Termini</Link>
                        <Link href="#" className="hover:text-white">LinkedIn</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.05] transition-all group"
        >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
            <p className="text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                {description}
            </p>
        </motion.div>
    );
}
