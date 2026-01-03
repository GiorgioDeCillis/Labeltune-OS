'use client';

import React, { useState } from 'react';
import { Lesson, QuizQuestion } from '@/types/manual-types';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { gradeWithAI } from '@/app/dashboard/courses/grading';
import { completeLesson } from '@/app/dashboard/courses/actions';

interface QuizPlayerProps {
    lesson: Lesson;
    onComplete: () => void;
}

export function QuizPlayer({ lesson, onComplete }: QuizPlayerProps) {
    const quizData = lesson.quiz_data || { questions: [], passing_score: 80 };
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [gradingResults, setGradingResults] = useState<Record<string, { score: number, feedback: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPassed, setHasPassed] = useState<boolean | null>(null);

    const handleOptionSelect = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleTextChange = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let totalScore = 0;
        let possibleScore = quizData.questions.length * 100;
        const newGradingResults: Record<string, { score: number, feedback: string }> = {};

        try {
            for (const q of quizData.questions) {
                const userAns = answers[q.id];

                if (q.type === 'multiple_choice') {
                    const isCorrect = userAns === q.correct_answer;
                    newGradingResults[q.id] = {
                        score: isCorrect ? 100 : 0,
                        feedback: isCorrect ? 'Correct!' : 'Incorrect.'
                    };
                    totalScore += isCorrect ? 100 : 0;
                } else if (q.type === 'open_text') {
                    // Call AI Grader
                    const result = await gradeWithAI(q.text, userAns, q.grading_criteria || '');
                    newGradingResults[q.id] = result;
                    totalScore += result.score;
                }
            }

            setGradingResults(newGradingResults);

            const finalPercentage = (totalScore / possibleScore) * 100;
            const passed = finalPercentage >= (quizData.passing_score || 80);

            setHasPassed(passed);

            if (passed) {
                await completeLesson(lesson.course_id, lesson.id);
                onComplete();
            }

        } catch (error) {
            console.error('Quiz Error:', error);
            alert('Something went wrong during grading.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasPassed) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center animate-in zoom-in-50">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Quiz Passed!</h3>
                <p className="text-muted-foreground">You have successfully completed this lesson.</p>
                <div className="p-4 bg-white/5 rounded-lg text-sm text-left w-full max-w-md mt-6">
                    <p className="font-bold mb-2">Grading Summary:</p>
                    {Object.entries(gradingResults).map(([key, result]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                            <span className="text-muted-foreground">{result.feedback}</span>
                            <span className={result.score >= 80 ? 'text-green-400' : 'text-red-400'}>{result.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    Passing Score: {quizData.passing_score}%
                </div>
            </div>

            <div className="space-y-8">
                {quizData.questions.map((q, i) => (
                    <div key={q.id} className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/5">
                        <h3 className="font-bold text-lg"><span className="text-primary mr-2">{i + 1}.</span> {q.text}</h3>

                        {q.type === 'multiple_choice' ? (
                            <div className="space-y-2">
                                {q.options?.map((opt, oIndex) => (
                                    <label
                                        key={oIndex}
                                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-all ${answers[q.id] === oIndex.toString()
                                                ? 'bg-primary/20 border-primary'
                                                : 'bg-black/20 border-transparent hover:bg-black/40'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[q.id] === oIndex.toString() ? 'border-primary' : 'border-muted-foreground'
                                            }`}>
                                            {answers[q.id] === oIndex.toString() && <div className="w-3 h-3 bg-primary rounded-full" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={oIndex}
                                            onChange={() => handleOptionSelect(q.id, oIndex.toString())}
                                            className="hidden"
                                            disabled={isSubmitting}
                                        />
                                        <span className={answers[q.id] === oIndex.toString() ? 'text-primary-foreground font-medium' : ''}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-4 min-h-[150px] focus:outline-none focus:border-primary"
                                    placeholder="Type your answer here..."
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">This answer will be graded by AI.</p>
                            </div>
                        )}

                        {/* Grading Feedback (if failed) */}
                        {gradingResults[q.id] && hasPassed === false && (
                            <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${gradingResults[q.id].score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <div>
                                    <p className="font-bold">Score: {gradingResults[q.id].score}%</p>
                                    <p>{gradingResults[q.id].feedback}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {hasPassed === false && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-bold">
                    You did not pass the quiz. Review the feedback above and try again.
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Grading...
                    </>
                ) : (
                    'Submit Quiz'
                )}
            </button>
        </div>
    );
}
