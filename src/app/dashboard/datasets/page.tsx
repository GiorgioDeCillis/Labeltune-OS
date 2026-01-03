'use client';

import { useState, useEffect } from 'react';
import { searchTasks } from './actions';
import { Search, Filter, Database, FileJson } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DatasetExplorerPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        // Fetch projects for filter
        const fetchProjects = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        };
        fetchProjects();
        handleSearch();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await searchTasks(query, selectedProject || undefined);
            setTasks(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dataset Explorer</h2>
                    <p className="text-muted-foreground">Search and inspect your labeled data.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="glass-panel p-4 rounded-xl flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search JSON content, labels, or IDs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="relative min-w-[200px]">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-primary"
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all"
                >
                    Search
                </button>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground">
                    Loading datasets...
                </div>
            ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                    <Database className="w-12 h-12 mb-4 opacity-50" />
                    <p>No results found for your query.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-muted-foreground">
                                            {task.projects?.name}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                task.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs text-muted-foreground">{task.id}</p>
                                </div>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <FileJson className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-black/40 rounded-lg p-3 font-mono text-xs overflow-x-auto custom-scrollbar">
                                    <div className="text-muted-foreground mb-1 uppercase text-[10px] font-bold">Input Data</div>
                                    <pre className="text-gray-300">{JSON.stringify(task.data, null, 2)}</pre>
                                </div>
                                <div className="bg-black/40 rounded-lg p-3 font-mono text-xs overflow-x-auto custom-scrollbar">
                                    <div className="text-muted-foreground mb-1 uppercase text-[10px] font-bold">Labels / Output</div>
                                    <pre className="text-primary/80">{JSON.stringify(task.labels || {}, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
