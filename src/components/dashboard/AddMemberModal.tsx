'use client';

import { useState } from 'react';
import { Search, Plus, X, Tag, User } from 'lucide-react';
import { searchProfiles, assignUserToProject } from '@/app/dashboard/projects/actions';
import { useToast } from '@/components/Toast';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    existingMemberIds: string[];
    onMemberAdded: () => void;
}

export function AddMemberModal({ isOpen, onClose, projectId, existingMemberIds, onMemberAdded }: AddMemberModalProps) {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState<string | null>(null);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const results = await searchProfiles(searchQuery, activeTags);
            // Filter out already added members
            setSearchResults(results.filter((u: any) => !existingMemberIds.includes(u.id)));
        } catch (error) {
            console.error('Search failed:', error);
            showToast('Failed to search users', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTag = () => {
        if (tagFilter && !activeTags.includes(tagFilter)) {
            setActiveTags([...activeTags, tagFilter]);
            setTagFilter('');
        }
    };

    const removeTag = (tag: string) => {
        setActiveTags(activeTags.filter(t => t !== tag));
    };

    const handleAddMember = async (userId: string) => {
        setIsAdding(userId);
        try {
            await assignUserToProject(projectId, userId);
            showToast('Member added successfully', 'success');
            onMemberAdded();
            // Remove from local list
            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to add member:', error);
            showToast('Failed to add member', 'error');
        } finally {
            setIsAdding(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-2xl shadow-2xl flex flex-col border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Search Controls */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Tag Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Filter by Tags</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Add tag filter (e.g. it_IT)..."
                                        value={tagFilter}
                                        onChange={(e) => setTagFilter(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <button
                                    onClick={handleAddTag}
                                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-sm font-bold rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {activeTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {activeTags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg border border-primary/20">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold mb-3 text-muted-foreground">Results</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {searchResults.length === 0 && !isSearching && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No users found. Try adjusting your search criteria.
                                </div>
                            )}

                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{user.full_name || 'Unnamed User'}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                            {user.tags && user.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {user.tags.map((tag: string) => (
                                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-muted-foreground">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddMember(user.id)}
                                        disabled={isAdding === user.id}
                                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isAdding === user.id ? 'Adding...' : 'Add'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
