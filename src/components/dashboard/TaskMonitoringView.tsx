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
    Activity,
    Copy,
    Check,
    Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { submitReviewerFeedback } from '@/app/dashboard/review/actions';
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
    currentUserRole?: string;
    backUrl?: string; // Optional back URL override
}

export function TaskMonitoringView({ task, project, annotator, reviewer, currentUserRole, backUrl }: TaskMonitoringViewProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [activeVersion, setActiveVersion] = useState<'annotator' | 'reviewer'>(
        (task.status === 'approved' || task.status === 'completed') ? 'reviewer' : 'annotator'
    );
    const [copied, setCopied] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const schema = project.template_schema as TaskComponent[];

    const handleCopy = () => {
        navigator.clipboard.writeText(task.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds) return '0s';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const currentLabels = activeVersion === 'annotator' ? (task.annotator_labels || task.labels) : task.labels;

    const isPrivileged = currentUserRole === 'admin' || currentUserRole === 'pm';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={backUrl || (currentUserRole === 'annotator' ? '/dashboard/history' : `/dashboard/projects/${project.id}/tasks`)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">Task Monitoring</h2>
                            <StatusBadge status={task.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 group/id">
                            <p className="text-sm text-muted-foreground font-mono">
                                Task #{task.id}
                            </p>
                            <button
                                onClick={handleCopy}
                                className="p-1 hover:bg-white/10 rounded transition-all opacity-0 group-hover/id:opacity-100"
                                title="Copy Task ID"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                            </button>
                            <span className="text-xs text-muted-foreground/40">•</span>
                            <span className="text-sm text-muted-foreground">{project.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className={`grid grid-cols-1 ${currentUserRole === 'annotator' ? '' : 'md:grid-cols-2'} gap-6`}>
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
                    <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Started At</p>
                            <p className="text-xs font-medium text-foreground">{formatDate(task.annotator_started_at)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Finished At</p>
                            <p className="text-xs font-medium text-foreground">{formatDate(task.annotator_completed_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Reviewer Info */}
                {currentUserRole !== 'annotator' && (
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
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Started At</p>
                                <p className="text-xs font-medium text-foreground">{formatDate(task.reviewer_started_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Finished At</p>
                                <p className="text-xs font-medium text-foreground">{formatDate(task.reviewer_completed_at)}</p>
                            </div>
                        </div>
                    </div>
                )}
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
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeVersion === 'annotator' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
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

                {/* Feedback Section */}
                <div className="flex flex-col">
                    {/* Reviewer -> Attempter Feedback (Visible in both if exists, but styled differently) */}
                    {task.review_feedback && (
                        <div className={`px-6 py-3 border-t border-white/5 ${activeVersion === 'annotator' ? 'bg-yellow-500/5' : 'bg-white/[0.02]'}`}>
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-yellow-500 mt-1" />
                                <div>
                                    <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-wider">Reviewer Feedback to Attempter</p>
                                    <p className="text-sm text-foreground/80 mt-0.5 italic">"{task.review_feedback}"</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin/PM -> Reviewer Feedback (Visible only in Reviewer tab) */}
                    {activeVersion === 'reviewer' && task.reviewer_feedback && (
                        <div className="px-6 py-3 border-t border-white/10 bg-primary/10">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-primary mt-1" />
                                <div>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Admin/PM Feedback to Reviewer</p>
                                    <p className="text-sm text-foreground/80 mt-0.5 italic">"{task.reviewer_feedback}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin/PM Feedback Form to Reviewer */}
            {(task.status === 'completed' && isPrivileged) && (
                <div className="glass-panel p-8 rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Feedback to Reviewer</h3>
                            <p className="text-sm text-muted-foreground">The task is complete. Please rate the reviewer's feedback to finalize the task.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Rating Selection */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Rate the quality of the review</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackRating(star)}
                                        className={`p-2 rounded-lg transition-all ${feedbackRating >= star ? 'bg-yellow-500/10 text-yellow-500 scale-110' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                                    >
                                        <Star className={`w-8 h-8 ${feedbackRating >= star ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Text */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Additional Comments (Optional)</p>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="What did you think of the review? Was it helpful?"
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <button
                            disabled={feedbackRating === 0 || isSubmittingFeedback}
                            onClick={async () => {
                                setIsSubmittingFeedback(true);
                                try {
                                    const result = await submitReviewerFeedback(task.id, feedbackRating, feedbackText);
                                    if (result.success) {
                                        showToast('Feedback submitted successfully and task finalized', 'success');
                                        router.refresh();
                                    } else {
                                        showToast(result.error || 'Error submitting feedback', 'error');
                                    }
                                } finally {
                                    setIsSubmittingFeedback(false);
                                }
                            }}
                            className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 group"
                        >
                            {isSubmittingFeedback ? (
                                <Timer className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Submit Feedback & Finalize
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-white/5 text-muted-foreground border-white/10',
        in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        submitted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        completed: 'bg-primary/10 text-primary border-primary/20',
        approved: 'bg-green-500/10 text-green-400 border-green-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const icons: Record<string, any> = {
        pending: Clock,
        in_progress: Timer,
        submitted: Clock,
        completed: AlertCircle,
        approved: CheckCircle2,
        rejected: AlertCircle,
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
