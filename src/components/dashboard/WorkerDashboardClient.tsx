'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, Wallet } from 'lucide-react';
import ProjectQueueModal from '@/components/dashboard/ProjectQueueModal';

export default function WorkerDashboardClient({ user, profile }: { user: any, profile: any }) {
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    // This simplified dashboard doesn't pre-fetch the "active project". 
    // Instead it focuses on the queue as requested. We can expand this to show the "Top 1" if needed.
    // For now, based on the request, we want the "Project Queue" action to open the list.

    return (
        <div className="space-y-12">
            <ProjectQueueModal
                isOpen={isQueueOpen}
                onClose={() => setIsQueueOpen(false)}
                userId={user.id}
            />

            {/* Hero Profile Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold">{profile?.full_name?.[0]}</span>
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">{profile?.full_name}</h1>
                    <p className="text-lg text-white/60">{user.email}</p>
                </div>
            </div>

            {/* Current Project Card Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Current Project</h2>
                    <button
                        onClick={() => setIsQueueOpen(true)}
                        className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                    >
                        Project Queue <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Default placeholder or 'Primary' project could go here. 
                    For now, showing a state that encourages opening the queue if no single project is highlighted contextually.
                 */}
                <div className="glass-panel p-12 rounded-2xl border-2 border-white/5 hover:border-primary/20 transition-all text-center cursor-pointer group" onClick={() => setIsQueueOpen(true)}>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                        <Wallet className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Start Labeling</h3>
                    <p className="text-muted-foreground">Check your project queue to start working on assigned tasks.</p>
                    <button className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-all">
                        Open Project Queue
                    </button>
                </div>
            </div>

            {/* Skills / Courses Section (Note: User wanted 'Courses' hidden in sidebar, probably here too if sensitive, 
               but request said "un account...non può vedere...Courses", implying specific navigation. 
               The Dashboard widget might be fine, but I'll hide it to be safe as it links to the restricted page.) 
            */}
        </div>
    );
}
