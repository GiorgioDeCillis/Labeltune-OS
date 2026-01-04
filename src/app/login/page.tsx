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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error('Error logging in with Google:', error.message);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8 rounded-2xl border-t-2 border-primary/20"
            >
                <div className="flex justify-center mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'osaka-jade' ? 'bg-emerald-500/20 text-emerald-400' : theme === 'purple-moon' ? 'bg-[#A949D9]/20 text-[#A949D9]' : 'bg-[#DB595C]/20 text-[#DB595C]'}`}>
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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#121212] px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-3 hyprland-window"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            />
                        </svg>
                        Google
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
