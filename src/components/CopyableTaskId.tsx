'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CopyableTaskId({ taskId }: { taskId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        if (!taskId) return;
        navigator.clipboard.writeText(taskId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1 group/id cursor-pointer" onClick={handleCopyId}>
            <p className="text-xs text-muted-foreground font-mono">Task ID: {taskId}</p>
            <button
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                title="Copy ID"
            >
                {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                    <Copy className="w-3 h-3 opacity-40 group-hover/id:opacity-100 transition-opacity" />
                )}
            </button>
        </div>
    );
}
