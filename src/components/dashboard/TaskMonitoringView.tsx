'use client';

import React, { useState } from 'react';
import {
    Clock,
    Timer,
    DollarSign,
    Star,
    User,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Eye,
    MessageSquare,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { TaskComponent } from '@/components/builder/types';
import {
    ImageObject,
    TextObject,
    AudioObject,
    HeaderComponent,
    VideoObject,
    TimeSeriesObject,
    PDFObject,
    MultiMessageObject,
    InstructionBlock,
    RequirementPanel,
    SideBySideLayout,
    RubricTable,
    ChoicesControl,
    RatingControl,
    TextAreaControl,
    ImageLabelsControl,
    RubricScorerControl,
    RankingControl,
    FeedbackControl
} from '@/components/builder/Renderers';

interface TaskMonitoringViewProps {
    task: any;
    project: any;
    annotator: any;
    reviewer: any;
}

export function TaskMonitoringView({ task, project, annotator, reviewer }: TaskMonitoringViewProps) {
    const [activeVersion, setActiveVersion] = useState<'annotator' | 'reviewer'>(task.status === 'approved' ? 'reviewer' : 'annotator');
    const schema = project.template_schema as TaskComponent[];

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds) return '0s';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const currentLabels = activeVersion === 'annotator' ? (task.annotator_labels || task.labels) : task.labels;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/projects/${project.id}/tasks`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">Task Monitoring</h2>
                            <StatusBadge status={task.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Task #{task.id} • {project.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Annotator Info */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold border border-primary/20 overflow-hidden">
                            {annotator?.avatar_url ? (
                                <img src={annotator.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                annotator?.full_name?.[0] || 'A'
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Attempter</h3>
                            <p className="text-sm text-muted-foreground">{annotator?.full_name || 'Unassigned'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Time Spent</p>
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                <Timer className="w-3.5 h-3.5 text-primary" />
                                <span>{formatTime(task.annotator_time_spent)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Earnings</p>
                            <div className="flex items-center gap-1.5 text-green-400 font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{task.annotator_earnings?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Rating</p>
                            <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{task.review_rating?.toFixed(1) || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviewer Info */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-16 h-16 text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-lg font-bold border border-yellow-500/20 overflow-hidden">
                            {reviewer?.avatar_url ? (
                                <img src={reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                reviewer?.full_name?.[0] || 'R'
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Reviewer</h3>
                            <p className="text-sm text-muted-foreground">{reviewer?.full_name || 'Not reviewed yet'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Time Spent</p>
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                <Timer className="w-3.5 h-3.5 text-yellow-500" />
                                <span>{formatTime(task.reviewer_time_spent)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Earnings</p>
                            <div className="flex items-center gap-1.5 text-green-400 font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{task.reviewer_earnings?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Rev. Rating</p>
                            <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                                <Star className="w-3.5 h-3.5" />
                                <span>{task.reviewer_rating?.toFixed(1) || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Comparison */}
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[700px]">
                {/* Version Toggle */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Preview Version</span>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveVersion('annotator')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeVersion === 'annotator' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Attempter
                        </button>
                        <button
                            onClick={() => setActiveVersion('reviewer')}
                            disabled={!task.reviewed_by}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeVersion === 'reviewer' ? 'bg-yellow-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}
                        >
                            Reviewer (Final)
                        </button>
                    </div>
                </div>

                {/* Main Renderer Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {schema.map((component) => (
                            <div key={component.id} className="pointer-events-none opacity-90">
                                {renderComponent(component, task.payload || {}, currentLabels || {})}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section (Optional) */}
                {task.review_feedback && (
                    <div className="px-6 py-4 border-t border-white/5 bg-yellow-500/5">
                        <div className="flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-yellow-500 mt-1" />
                            <div>
                                <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-wider">Reviewer Feedback</p>
                                <p className="text-sm text-foreground/80 mt-1 italic">"{task.review_feedback}"</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-white/5 text-muted-foreground border-white/10',
        in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        completed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    const icons: Record<string, any> = {
        pending: Clock,
        in_progress: Timer,
        completed: AlertCircle,
        approved: CheckCircle2,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            <Icon className="w-3 h-3" />
            {status.replace('_', ' ')}
        </span>
    );
}

function renderComponent(component: TaskComponent, payload: any, labels: any) {
    const commonProps = { key: component.id, component, data: payload };
    const value = labels[component.name] || labels[component.id];

    switch (component.type) {
        // Objects
        case 'Image': return <ImageObject {...commonProps} />;
        case 'Text': return <TextObject {...commonProps} />;
        case 'Audio': return <AudioObject {...commonProps} />;
        case 'Header': return <HeaderComponent component={component} />;
        case 'Video': return <VideoObject {...commonProps} />;
        case 'TimeSeries': return <TimeSeriesObject {...commonProps} />;
        case 'PDF': return <PDFObject {...commonProps} />;
        case 'MultiMessage': return <MultiMessageObject {...commonProps} />;

        // Pogo Workflow Components
        case 'InstructionBlock': return <InstructionBlock {...commonProps} />;
        case 'RequirementPanel': return <RequirementPanel component={component} />;
        case 'SideBySide': return <SideBySideLayout {...commonProps} />;
        case 'RubricTable': return <RubricTable component={component} />;

        // Controls (Read-only view)
        case 'Choices': return <ChoicesControl component={component} value={value} onChange={() => { }} />;
        case 'Rating': return <RatingControl component={component} value={value} onChange={() => { }} />;
        case 'TextArea': return <TextAreaControl component={component} value={value} onChange={() => { }} />;
        case 'Labels':
        case 'RectangleLabels': return <ImageLabelsControl component={component} value={value} onChange={() => { }} />;
        case 'RubricScorer': return <RubricScorerControl component={component} value={value} onChange={() => { }} />;
        case 'Ranking': return <RankingControl component={component} value={value} onChange={() => { }} />;
        case 'Feedback': return <FeedbackControl component={component} value={value} onChange={() => { }} />;

        default: return <div key={component.id} className="text-red-400 text-xs">Unsupported component: {component.type}</div>;
    }
}
