import React from 'react';
import { Lesson, QuizQuestion } from '@/types/manual-types';
import { Plus, Trash2 } from 'lucide-react';

interface QuizBuilderProps {
    lesson: Partial<Lesson>;
    onChange: (data: any) => void;
}

export function QuizBuilder({ lesson, onChange }: QuizBuilderProps) {
    const quizData = lesson.quiz_data || { questions: [], passing_score: 80 };

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: `q-${Date.now()}`,
            text: '',
            type: 'multiple_choice',
            options: ['', ''],
            correct_answer: '0'
        };
        onChange({
            ...quizData,
            questions: [...quizData.questions, newQuestion]
        });
    };

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        onChange({ ...quizData, questions: updatedQuestions });
    };

    const removeQuestion = (index: number) => {
        const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
        onChange({ ...quizData, questions: updatedQuestions });
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updatedQuestions = [...quizData.questions];
        const options = [...(updatedQuestions[qIndex].options || [])];
        options[oIndex] = value;
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options };
        onChange({ ...quizData, questions: updatedQuestions });
    };

    const addOption = (qIndex: number) => {
        const updatedQuestions = [...quizData.questions];
        const options = [...(updatedQuestions[qIndex].options || [])];
        options.push('');
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options };
        onChange({ ...quizData, questions: updatedQuestions });
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...quizData.questions];
        const options = [...(updatedQuestions[qIndex].options || [])];
        const newOptions = options.filter((_, i) => i !== oIndex);
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: newOptions };
        onChange({ ...quizData, questions: updatedQuestions });
    }


    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold">Passing Score (%)</label>
                <input
                    type="number"
                    value={quizData.passing_score}
                    onChange={(e) => onChange({ ...quizData, passing_score: parseInt(e.target.value) })}
                    className="bg-white/5 border border-white/10 rounded-lg p-2 w-24 focus:outline-none focus:border-primary"
                />
            </div>

            <div className="space-y-6">
                {quizData.questions.map((q, i) => (
                    <div key={q.id} className="bg-white/5 rounded-lg p-4 space-y-4 border border-white/10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1 mr-4">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-sm text-primary">Question {i + 1}</h4>
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded text-xs p-1"
                                    >
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="open_text">Open Text (AI)</option>
                                    </select>
                                </div>
                                <input
                                    value={q.text}
                                    onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary"
                                    placeholder="Enter question text..."
                                />
                            </div>
                            <button onClick={() => removeQuestion(i)} className="text-muted-foreground hover:text-red-400 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Options / Criteria */}
                        {q.type === 'multiple_choice' ? (
                            <div className="space-y-2 pl-4 border-l-2 border-white/5">
                                <label className="text-xs uppercase text-muted-foreground font-bold">Options</label>
                                {q.options?.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${q.id}`}
                                            checked={q.correct_answer === oIndex.toString()}
                                            onChange={() => updateQuestion(i, 'correct_answer', oIndex.toString())}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <input
                                            value={opt}
                                            onChange={(e) => updateOption(i, oIndex, e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded p-1.5 text-sm focus:outline-none focus:border-primary"
                                            placeholder={`Option ${oIndex + 1}`}
                                        />
                                        <button onClick={() => removeOption(i, oIndex)} className="text-muted-foreground hover:text-white">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addOption(i)} className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                                    <Plus className="w-3 h-3" /> Add Option
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pl-4 border-l-2 border-white/5">
                                <label className="text-xs uppercase text-muted-foreground font-bold">AI Grading Criteria</label>
                                <textarea
                                    value={q.grading_criteria || ''}
                                    onChange={(e) => updateQuestion(i, 'grading_criteria', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm h-24 focus:outline-none focus:border-primary"
                                    placeholder="Describe what a correct answer should contain..."
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Question
            </button>
        </div>
    );
}
