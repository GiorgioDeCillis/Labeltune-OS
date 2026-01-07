import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Increase max duration to 300 seconds (5 minutes) to handle very long generations
export const maxDuration = 300;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { sections, prompt } = body;

        if (!sections || !Array.isArray(sections)) {
            return NextResponse.json(
                { error: 'Invalid request: "sections" array is required' },
                { status: 400 }
            );
        }

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: "prompt" string is required' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert technical writer and editor. Your task is to improve, modify, or reorganize a set of project instructions based on a user's specific request.

INPUT FORMAT:
You will receive a JSON object with a "sections" array. Each section has an "id", "title" and "content".

USER REQUEST:
"${prompt}"

RULES:
1. **Preserve IDs**: If you modify an existing section, keep its "id". If you create a NEW section, generate a new UUID or use a placeholder that the frontend can replace.
2. **Follow Instructions**: Strictly follow the user's request (e.g., "translate to Italian", "add emojis", "simplify language", "merge sections").
3. **No Conversational Filler**: Do not output "Here are the improved instructions". Just output the JSON.
4. **JSON Output**: You MUST return the result in this JSON format:
   {
     "sections": [
       {
         "id": "...",
         "title": "...",
         "content": "..."
       }
     ]
   }

If the user asks to delete sections, omit them from the output array.
If the user asks to reorder, change the order in the array.
If the user asks to rewrite, modify the "content" and/or "title" fields.`
                },
                {
                    role: 'user',
                    content: JSON.stringify({ sections })
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content);

        // Ensure robust ID handling (fallback if AI drops IDs or adds new ones without IDs)
        const sectionsWithIds = parsed.sections?.map((section: any) => ({
            ...section,
            id: section.id || crypto.randomUUID(),
        })) || [];

        return NextResponse.json({ sections: sectionsWithIds });

    } catch (error) {
        console.error('Error improving instructions:', error);
        return NextResponse.json(
            { error: 'Failed to process instructions' },
            { status: 500 }
        );
    }
}
