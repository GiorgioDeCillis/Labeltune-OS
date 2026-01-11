'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { updateProject } from '@/app/dashboard/projects/actions';
import CustomSelect from '@/components/CustomSelect';
import CustomDateInput from '@/components/CustomDateInput';
import { Project } from '@/types/manual-types';

const PROJECT_TYPE_OPTIONS = [
    { code: 'text_classification', name: 'Text Classification' },
    { code: 'image_classification', name: 'Image Classification' },
    { code: 'image_bounding_box', name: 'Object Detection' },
    { code: 'sentiment_analysis', name: 'Sentiment Analysis' },
    { code: 'generation', name: 'Chatbot Evaluation (RLHF)' },
    { code: 'audio_transcription', name: 'Audio Transcription' },
    { code: 'video_tracking', name: 'Video Object Tracking' },
    { code: 'time_series', name: 'Time Series Anomaly' },
    { code: 'pdf_extraction', name: 'PDF Data Extraction' },
    { code: 'rlhf_pogo', name: 'Safe & Helpful RLHF' },
];

const STATUS_OPTIONS = [
    { code: 'active', name: 'Active' },
    { code: 'paused', name: 'Paused' },
    { code: 'completed', name: 'Completed' },
    { code: 'archived', name: 'Archived' },
];

const PAYMENT_MODE_OPTIONS = [
    { code: 'hourly', name: 'Hourly Rate' },
    { code: 'task', name: 'Pay Per Task' }
];

interface ProjectEditFormProps {
    project: Project;
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
    const [paymentMode, setPaymentMode] = useState<string>(project.payment_mode || 'hourly');
    const updateProjectWithId = updateProject.bind(null, project.id);

    return (
        <form action={updateProjectWithId} className="glass-panel p-8 rounded-xl space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Project Name</label>
                <input
                    name="name"
                    defaultValue={project.name}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Description</label>
                <textarea
                    name="description"
                    defaultValue={project.description || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary h-32"
                />
            </div>

            <div className="grid grid-cols-2 gap-6 !overflow-visible">
                <div className="space-y-2 !overflow-visible">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Project Type</label>
                    <CustomSelect
                        name="type"
                        label="Project Type"
                        placeholder="Select a type"
                        options={PROJECT_TYPE_OPTIONS}
                        defaultValue={project.type}
                    />
                </div>

                <div className="space-y-2 !overflow-visible">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Status</label>
                    <CustomSelect
                        name="status"
                        label="Status"
                        placeholder="Select status"
                        options={STATUS_OPTIONS}
                        defaultValue={project.status}
                    />
                </div>
            </div>

            {/* Payment Configuration */}
            <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="font-bold text-lg">Payment Settings</h4>
                <div className="grid grid-cols-2 gap-6 !overflow-visible">
                    <div className="space-y-2 !overflow-visible">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Payment Mode</label>
                        <CustomSelect
                            name="payment_mode"
                            label="Payment Mode"
                            placeholder="Select mode"
                            options={PAYMENT_MODE_OPTIONS}
                            defaultValue={paymentMode}
                            onChange={(val) => setPaymentMode(val)}
                        />
                    </div>
                    {paymentMode === 'hourly' ? (
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Hourly Rate</label>
                            <input
                                name="pay_rate"
                                defaultValue={project.pay_rate || '€15.00 / hr'}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Annotator Pay Per Task</label>
                                <input
                                    name="pay_per_task"
                                    defaultValue={project.pay_per_task || '€0.50 / task'}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Reviewer Pay Per Task</label>
                                <input
                                    name="review_pay_per_task"
                                    defaultValue={project.review_pay_per_task || '€0.25 / task'}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Project Timing */}
            <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="font-bold text-lg">Project Schedule</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Start Date</label>
                        <CustomDateInput
                            name="start_date"
                            defaultValue={project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : ''}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Expected End Date</label>
                        <CustomDateInput
                            name="expected_end_date"
                            defaultValue={project.expected_end_date ? new Date(project.expected_end_date).toISOString().split('T')[0] : ''}
                        />
                    </div>
                </div>
            </div>

            {/* Timing Configuration */}
            <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="font-bold text-lg">Task Timing</h4>
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Max Task Time (min)</label>
                        <input
                            name="max_task_time"
                            type="number"
                            defaultValue={project.max_task_time ? Math.round(project.max_task_time / 60) : ''}
                            placeholder="30"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Extra Time (min)</label>
                        <input
                            name="extra_time_after_max"
                            type="number"
                            defaultValue={project.extra_time_after_max ? Math.round(project.extra_time_after_max / 60) : ''}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Absolute Expiration (min)</label>
                        <input
                            name="absolute_expiration_duration"
                            type="number"
                            defaultValue={project.absolute_expiration_duration ? Math.round(project.absolute_expiration_duration / 60) : ''}
                            placeholder="60"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Total Tasks</label>
                        <input
                            name="total_tasks"
                            type="number"
                            defaultValue={project.total_tasks || ''}
                            placeholder="1000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Review Configuration */}
            <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="font-bold text-lg">Review Configuration</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Review Task Time (min)</label>
                        <input
                            name="review_task_time"
                            type="number"
                            defaultValue={project.review_task_time ? Math.round(project.review_task_time / 60) : ''}
                            placeholder="30"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Review Extra Time (min)</label>
                        <input
                            name="review_extra_time"
                            type="number"
                            defaultValue={project.review_extra_time ? Math.round(project.review_extra_time / 60) : ''}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Guidelines (Markdown)</label>
                <textarea
                    name="guidelines"
                    defaultValue={project.guidelines || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary h-48 font-mono text-sm"
                    placeholder="# Project Guidelines..."
                />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
                <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> Save Changes
                </button>
            </div>
        </form>
    );
}
