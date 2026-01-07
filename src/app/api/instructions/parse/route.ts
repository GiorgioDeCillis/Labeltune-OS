import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: "text" field is required' },
                { status: 400 }
            );
        }

        // Limit input size to avoid excessive token usage/cost
        // 100k chars is roughly 25k tokens, well within gpt-4o-mini limits but safe sanity check
        const truncatedText = text.slice(0, 100000);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert technical writer and document parser. 
                    Your task is to extract project instructions from raw text that was extracted from a PDF.
                    
                    The raw text may contain artifacts like watermarks (e.g., "CONFIDENTIAL", "DRAFT", "DO NOT DISTRIBUTE"), headers, footers, or page numbers mixed in with the real content.
                    
                    You must:
                    1. IGNORE all watermarks, headers, footers, and page numbers.
                    2. Identify logical sections in the instructions (e.g., "Overview", "Labeling Guide", "Examples").
                    3. For each section, extract the Title and the Content.
                    4. Format the Content as clean, well-formatted Markdown.
                    5. Return the result as a JSON object containing an array of sections.

                    The output format must be exactly:
                    {
                        "sections": [
                            {
                                "title": "Section Title",
                                "content": "Markdown content here..."
                            }
                        ]
                    }
                    `
                },
                {
                    role: 'user',
                    content: `Here is the raw text from the document:\n\n${truncatedText}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1, // Low temperature for consistent, factual extraction
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content);

        // Ensure every section has a unique ID
        const sectionsWithIds = parsed.sections.map((section: any) => ({
            ...section,
            id: crypto.randomUUID(),
        }));

        return NextResponse.json({ sections: sectionsWithIds });

    } catch (error) {
        console.error('Error parsing instructions:', error);
        return NextResponse.json(
            { error: 'Failed to process instructions' },
            { status: 500 }
        );
    }
}
