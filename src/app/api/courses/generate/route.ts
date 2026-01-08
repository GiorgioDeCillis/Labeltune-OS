import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Increase max duration to 300 seconds (5 minutes) to handle complex course generation
export const maxDuration = 300;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

import { InstructionSection } from '@/types/manual-types';

interface GenerationOptions {
    lessonCount?: number;
    questionsPerQuiz?: number;
    includeIntro?: boolean;
    includeFinalAssessment?: boolean;
}

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { instructions, options = {} }: { instructions: InstructionSection[], options?: GenerationOptions } = body;

        if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request: "instructions" array with at least one section is required' },
                { status: 400 }
            );
        }

        const {
            lessonCount = 0, // 0 = auto
            questionsPerQuiz = 4,
            includeIntro = true,
            includeFinalAssessment = true
        } = options;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert instructional designer and course creator. Your task is to transform project instructions into a complete training course with both explanatory lessons AND quiz lessons.

COURSE STRUCTURE REQUIREMENTS:
1. **Explanatory Lessons (type: "text")**: These should synthesize and explain the instructions in a clear, concise manner. Use markdown for formatting. Break complex topics into digestible sections. Include examples where helpful.

2. **Quiz Lessons (type: "quiz")**: These test comprehension of the material. Each quiz should have multiple-choice questions based on the explanatory content.

RULES:
${includeIntro ? '- Start with an "Introduction" lesson that provides an overview of what will be covered.' : '- Do NOT include an introduction lesson.'}
${includeFinalAssessment ? '- End with a "Final Assessment" quiz that covers all key topics.' : '- Do NOT include a final assessment.'}
- Alternate between explanatory lessons and quiz lessons where appropriate.
- Each explanatory lesson should cover 1-3 instruction sections in a synthesized way.
- Quiz lessons should directly follow the explanatory content they test.
${lessonCount > 0 ? `- Create approximately ${lessonCount} lessons total.` : '- Create an appropriate number of lessons based on the content volume (typically 4-8 lessons).'}
- Each quiz should have ${questionsPerQuiz} questions.
- For multiple choice questions, provide 4 options with one correct answer.
- Questions should test understanding, not just memorization.

OUTPUT FORMAT (JSON):
{
  "course": {
    "title": "Course title based on instructions topic",
    "description": "Brief course description (1-2 sentences)",
    "duration": "Estimated duration (e.g., '30m', '1h 15m')"
  },
  "lessons": [
    {
      "title": "Lesson title",
      "type": "text",
      "content": "Markdown content explaining the topic..."
    },
    {
      "title": "Quiz: Topic Name",
      "type": "quiz",
      "quiz_data": {
        "questions": [
          {
            "id": "q1",
            "text": "Question text?",
            "type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "0"
          }
        ],
        "passing_score": 80
      }
    }
  ]
}

IMPORTANT:
- For quiz questions, "correct_answer" is the INDEX (as string) of the correct option (0-based).
- Make explanatory content comprehensive but concise - synthesize, don't just copy.
- Use emojis sparingly in lesson titles for visual appeal.
- Ensure all content is in the same language as the input instructions.`
                },
                {
                    role: 'user',
                    content: `Transform these instructions into a training course:\n\n${JSON.stringify(instructions, null, 2)}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content);

        // Validate and ensure proper structure
        if (!parsed.course || !parsed.lessons || !Array.isArray(parsed.lessons)) {
            throw new Error('Invalid response structure from AI');
        }

        // Add IDs to lessons and questions
        const lessonsWithIds = parsed.lessons.map((lesson: any, index: number) => {
            const lessonId = `lesson-${Date.now()}-${index}`;

            if (lesson.type === 'quiz' && lesson.quiz_data?.questions) {
                lesson.quiz_data.questions = lesson.quiz_data.questions.map((q: any, qIndex: number) => ({
                    ...q,
                    id: q.id || `q-${Date.now()}-${qIndex}`
                }));
            }

            return {
                ...lesson,
                id: lessonId,
                order: index,
                content: lesson.content || '',
                video_url: ''
            };
        });

        return NextResponse.json({
            course: parsed.course,
            lessons: lessonsWithIds
        });

    } catch (error) {
        console.error('Error generating course:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate course' },
            { status: 500 }
        );
    }
}
