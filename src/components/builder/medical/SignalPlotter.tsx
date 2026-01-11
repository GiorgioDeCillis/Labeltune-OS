'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TaskComponent } from '../types';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SignalPlotterProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
    height?: string;
}

export function SignalPlotter({ component, value, readOnly, height = "400px" }: SignalPlotterProps) {
    // Generate mock ECG data
    const generateData = (points: number) => {
        const data = [];
        for (let i = 0; i < points; i++) {
            // Simulate ECG-like wave: P, QRS, T
            const x = i % 100;
            let y = Math.random() * 0.2; // noise

            if (x > 10 && x < 20) y += 0.3; // P wave
            if (x > 30 && x < 35) y -= 0.5; // Q
            if (x > 35 && x < 45) y += 2.0; // R
            if (x > 45 && x < 50) y -= 1.0; // S
            if (x > 60 && x < 80) y += 0.5; // T wave

            data.push(y);
        }
        return data;
    };

    const [chartData, setChartData] = useState<any>({
        labels: Array.from({ length: 200 }, (_, i) => i),
        datasets: [{
            label: 'Lead I',
            data: generateData(200),
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4
        },
        {
            label: 'Lead II',
            data: generateData(200).map(v => v + 3), // Offset
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4
        }]
    });

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 }, // Disable animation for performance
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#888' }
            },
            title: {
                display: false,
            },
            tooltip: {
                enabled: !readOnly
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#666', maxTicksLimit: 10 }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#666' }
            }
        }
    };

    return (
        <div className="w-full bg-black/50 rounded-lg border border-white/10 p-4" style={{ height }}>
            <Line options={options} data={chartData} />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
                <div>Sample Rate: 500Hz</div>
                <div>Gain: 10mm/mV</div>
                <div>Speed: 25mm/s</div>
            </div>
        </div>
    );
}
