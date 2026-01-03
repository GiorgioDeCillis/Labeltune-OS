'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { login, signup } from './actions';
import { useState, useEffect } from 'react';
import { Zap, Lock, Mail, User, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('annotator');
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push('/dashboard');
            }
        };
        checkAuth();
    }, []);

    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8 rounded-2xl border-t-2 border-primary/20"
            >
                <div className="flex justify-center mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'osaka-jade' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#DB595C]/20 text-[#DB595C]'}`}>
                        <Zap className="w-6 h-6" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">
                    {isLogin ? 'Welcome Back' : 'Join Labeltune'}
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                    {isLogin ? 'Enter your credentials to access the workspace' : 'Create an account to start labeling'}
                </p>

                <form className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-background/50 border border-white/10 rounded-xl px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['annotator', 'reviewer'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`px-4 py-2 rounded-lg text-sm capitalize border transition-all ${role === r
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-background/30 border-transparent hover:bg-white/5'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {/* Hidden input for server action */}
                                <input type="hidden" name="role" value={role} />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        formAction={isLogin ? login : signup}
                        className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6 hyprland-window"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
