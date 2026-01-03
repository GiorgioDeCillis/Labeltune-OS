'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, Layout, Users, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { theme, setTheme, wallpaper, setWallpaper } = useTheme();

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
      {/* Header */}
      <header className="flex justify-between items-center glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">Labeltune OS</h1>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setTheme('osaka-jade')}
            className={`px-4 py-2 rounded-full transition-all ${theme === 'osaka-jade' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/5'}`}
          >
            Osaka Jade
          </button>
          <button
            onClick={() => setTheme('ayaka')}
            className={`px-4 py-2 rounded-full transition-all ${theme === 'ayaka' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/5'}`}
          >
            Ayaka
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 gap-8 items-center py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-6xl font-black leading-tight tracking-tight">
            The Future of <br />
            <span className="text-primary">Data Labeling</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Enterprise-grade labeling platform for AI models. Scale your data production with real-time analytics, automated workflows, and a premium developer experience.
          </p>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hyprland-window hover:scale-105 transition-transform active:scale-95">
                Get Started
              </button>
            </Link>
            <button className="px-8 py-4 glass-panel rounded-xl font-bold hover:bg-white/5 transition-all">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Cards Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          <FeatureCard
            icon={<Layout className="w-6 h-6" />}
            title="Modern Interface"
            desc="Hyprland-inspired UI with glassmorphism."
            active
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Role Based"
            desc="Specific views for Annotators and Reviewers."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Real-time Analytics"
            desc="Monitor throughput and quality live."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Enterprise Ready"
            desc="RLS policies and advanced security."
          />
        </motion.div>
      </section>

      {/* Wallpaper Switcher Section */}
      <section className="glass-panel p-8 rounded-2xl space-y-6 mt-auto">
        <h3 className="text-xl font-bold">Customize Background</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {theme === 'osaka-jade' ? (
            ['1', '2', '3'].map((n) => (
              <WallpaperItem
                key={n}
                url={`/themes/osaka-jade/${n}-osaka-jade-bg.jpg`}
                active={wallpaper.includes(`${n}-osaka-jade-bg`)}
                onClick={() => setWallpaper(`/themes/osaka-jade/${n}-osaka-jade-bg.jpg`)}
              />
            ))
          ) : (
            ['b2', 'b8'].map((n) => (
              <WallpaperItem
                key={n}
                url={`/themes/ayaka/${n}.jpg`}
                active={wallpaper.includes(n)}
                onClick={() => setWallpaper(`/themes/ayaka/${n}.jpg`)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc, active = false }: { icon: React.ReactNode, title: string, desc: string, active?: boolean }) {
  return (
    <div className={`glass-panel p-6 rounded-2xl flex flex-col gap-4 ${active ? 'hyprland-active-border' : 'hover:scale-[1.02] transition-transform'}`}>
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function WallpaperItem({ url, active, onClick }: { url: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative min-w-[200px] h-[120px] rounded-xl overflow-hidden border-2 transition-all ${active ? 'border-primary scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
    >
      <img src={url} alt="Wallpaper" className="w-full h-full object-cover" />
      {active && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground p-1 rounded-full">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      )}
    </button>
  );
}
