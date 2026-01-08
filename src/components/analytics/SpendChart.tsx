'use client';

import { Wallet } from 'lucide-react';

interface SpendChartProps {
    data: { label: string; value: number }[];
    total: string;
}

export function SpendChart({ data, total }: SpendChartProps) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-muted-foreground" /> Spend Analysis
                </h3>
                <span className="text-xl font-bold">{total}</span>
            </div>

            <div className="h-64 flex items-end justify-between gap-3 px-2 border-b border-white/10 pb-4">
                {data.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div
                            className="w-full bg-primary/20 group-hover:bg-primary/60 transition-all duration-300 rounded-t-lg relative"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs font-bold whitespace-nowrap transition-opacity">
                                €{item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between px-2">
                {data.map((item, i) => (
                    <span key={i} className="text-xs text-muted-foreground font-bold uppercase w-full text-center truncate px-1">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
