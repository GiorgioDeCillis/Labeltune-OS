'use client';

import React, { useState } from 'react';
import { TaskComponent } from '../types';
import { MessageSquare, Edit2, Check, X, Bot, User, Sparkles } from 'lucide-react';

interface ChatEditorProps {
    component: TaskComponent;
    value?: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isEdited?: boolean;
    originalContent?: string;
}

export function ChatEditor({ component, value, onChange, readOnly }: ChatEditorProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'user', content: "Explain the concept of 'Zero Knowledge Proofs' to a 5 year old." },
        { role: 'assistant', content: "Zero Knowledge Proofs are like a magic trick where you prove you know a secret without telling the secret itself. Imagine you have a locked box and you want to prove you have the key without showing the key. You open the box!" }
    ]);

    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editBuffer, setEditBuffer] = useState('');

    const startEdit = (idx: number) => {
        if (readOnly) return;
        setEditingIdx(idx);
        setEditBuffer(messages[idx].content);
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditBuffer('');
    };

    const saveEdit = (idx: number) => {
        const newMessages = [...messages];
        newMessages[idx] = {
            ...newMessages[idx],
            content: editBuffer,
            isEdited: true,
            originalContent: newMessages[idx].originalContent || newMessages[idx].content
        };
        setMessages(newMessages);
        onChange(newMessages); // In real app, sync with component value
        setEditingIdx(null);
    };

    return (
        <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-zinc-950 flex flex-col h-[700px]">
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={18} />
                    <div>
                        <h3 className="text-sm font-bold text-white">RLHF Rewrite Editor</h3>
                        <p className="text-xs text-muted-foreground">Improve the model's response to create Golden Data.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={16} className="text-indigo-400" />
                            </div>
                        )}

                        <div className={`max-w-[80%] group relative ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                            {/* Message Bubble */}
                            {editingIdx === idx ? (
                                <div className="w-full min-w-[400px] border border-blue-500/50 rounded-lg bg-blue-900/10 p-2">
                                    <textarea
                                        className="w-full bg-transparent border-none focus:outline-none text-sm leading-relaxed text-white min-h-[150px] resize-y"
                                        value={editBuffer}
                                        onChange={(e) => setEditBuffer(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
                                        <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded hover:bg-white/10 text-muted-foreground">Cancel</button>
                                        <button onClick={() => saveEdit(idx)} className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1">
                                            <Check size={12} /> Save Improvements
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-xl text-sm leading-relaxed border ${msg.role === 'user'
                                        ? 'bg-zinc-800 border-zinc-700 text-white rounded-tr-none'
                                        : 'bg-black border-zinc-800 text-zinc-300 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.content}

                                    {msg.isEdited && (
                                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-[10px] text-green-400 uppercase font-bold tracking-wider">
                                            <Edit2 size={10} /> Edited by Human
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit Button (Only for assistant) */}
                            {msg.role === 'assistant' && editingIdx !== idx && !readOnly && (
                                <button
                                    onClick={() => startEdit(idx)}
                                    className="absolute -right-8 top-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                                    title="Rewrite this response"
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={16} className="text-zinc-400" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                <button className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Auto-Save Enabled
                </button>
            </div>
        </div>
    );
}
