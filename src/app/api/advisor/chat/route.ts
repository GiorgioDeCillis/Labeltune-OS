import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
        const { messages, instructionContent } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        if (!instructionContent) {
            return NextResponse.json(
                { error: 'Instruction content is required' },
                { status: 400 }
            );
        }

        // Flatten instruction content
        const flattenContent = Array.isArray(instructionContent)
            ? instructionContent.map((s: any) => `## ${s.title}\n${s.content}`).join('\n\n')
            : JSON.stringify(instructionContent);

        const systemMessage = {
            role: 'system',
            content: `You are a helpful and precise AI assistant called "Labeltune Advisor".
You are chatting with a user about a specific set of labeling instructions.

YOUR GOAL:
Help the user understand the instructions, clarify ambiguities, and make decisions based on the guidelines.
Always reference the specific relevant sections of the instructions when answering.

CONTEXT (The Instructions):
===========================
${flattenContent}
===========================

If the user asks something not covered in the instructions, explicitly state that it's not covered but offer a best-effort interpretation if reasonable, or ask them to check with a manager.
`
        };

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                systemMessage,
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                }))
            ],
            temperature: 0.5,
            max_tokens: 1000,
        });

        return NextResponse.json({ message: completion.choices[0].message });

    } catch (error: any) {
        console.error('Advisor Chat Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
