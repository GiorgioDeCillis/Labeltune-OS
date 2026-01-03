'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface QualityMetricProps {
    score: number; // 0-100
    label: string;
    trend?: number; // percentage change
    data?: number[]; // simplified trend data
}

export function QualityMetric({ score, label, trend, data = [] }: QualityMetricProps) {
    const isPositive = trend && trend >= 0;

    return (
        <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase">{label}</span>
                {trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>

            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight">{score}%</span>
            </div>

            {/* Simple SVG Trend Line */}
            <div className="h-16 w-full flex items-end gap-1">
                {data.map((value, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-white/10 hover:bg-primary/50 transition-colors rounded-t-sm"
                        style={{ height: `${value}%` }}
                        title={`Batch ${i + 1}: ${value}%`}
                    />
                ))}
            </div>

            <p className="text-xs text-muted-foreground">Based on last {data.length} batches</p>
        </div>
    );
}
