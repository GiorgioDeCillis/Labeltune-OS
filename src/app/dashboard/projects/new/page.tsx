

import { createProject } from '../actions';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';

export default function NewProjectPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Project</h2>
                    <p className="text-muted-foreground">Setup a new data labeling campaign.</p>
                </div>
            </div>

            <form action={createProject} className="glass-panel p-8 rounded-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <input
                        name="name"
                        required
                        placeholder="e.g. Sentiment Analysis Dataset"
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Describe the goal of this project..."
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                            name="type"
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                        >
                            <option value="text_classification">Text Classification</option>
                            <option value="image_bounding_box">Image Bounding Box</option>
                            <option value="ner">Named Entity Recognition</option>
                            <option value="rlhf">RLHF / Ranking</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select
                            disabled
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                        >
                            <option>Normal (Standard)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Guidelines (Markdown)</label>
                    <textarea
                        name="guidelines"
                        rows={6}
                        placeholder="# Labeling Guidelines..."
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <Link href="/dashboard/projects">
                        <button type="button" className="px-6 py-3 rounded-xl hover:bg-white/5 transition-all">
                            Cancel
                        </button>
                    </Link>
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}
