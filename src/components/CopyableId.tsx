'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyableIdProps {
    id: string;
    label?: string;
    showLabel?: boolean;
}

export function CopyableId({ id, label = "ID", showLabel = true }: CopyableIdProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1 group/id cursor-pointer" onClick={handleCopyId}>
            <p className="text-xs text-muted-foreground font-mono">
                {showLabel && <span className="mr-1">{label}:</span>}
                {id}
            </p>
            <button
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                title={`Copy ${label}`}
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
