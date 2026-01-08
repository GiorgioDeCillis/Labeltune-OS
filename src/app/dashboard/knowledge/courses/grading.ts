'use server';

interface GradeResult {
    score: number; // 0-100
    feedback: string;
}

export async function gradeWithAI(question: string, userAnswer: string, criteria: string): Promise<GradeResult> {
    // In a real implementation, you would call OpenAI/Anthropic API here.
    // For this prototype, we'll simulate a lenient generic grader.

    console.log('AI Grading Request:', { question, userAnswer, criteria });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic heuristic for demo purposes:
    // If the answer is too short, fail it.
    if (userAnswer.length < 10) {
        return {
            score: 0,
            feedback: "Answer is too short. Please provide more detail."
        };
    }

    // Mock successful grading
    return {
        score: 100,
        feedback: "Good answer! You covered the main points."
    };
}
