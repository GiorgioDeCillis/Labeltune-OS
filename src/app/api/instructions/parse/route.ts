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

        const body = await req.json();
        const { image } = body; // Base64 image string

        if (!image || typeof image !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: "image" field (base64) is required' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert technical writer and document digitizer.
                    
                    Your task is to transcribe the content of the provided document page into structured data.
                    
                    CRITICAL RULES:
                    1. **IGNORE WATERMARKS**: The document may have diagonal watermarks (e.g., "CONFIDENTIAL", "DRAFT", logos). IGNORE them completely. Treat the text as if the watermark is not there.
                    2. **PRESERVE FORMATTING**: Keep bolding, lists, and headers. Use Markdown.
                    3. **PRESERVE EMOJIS**: If there are emojis in the text, keep them.
                    4. **DESCRIBE IMAGES**: If there is a diagram, screenshot, or important image, add a placeholder in italics: *[Image: Description of the image]*.
                    5. **STRUCTURE**: Identify if this page contains a new section or continues a previous one.
                    
                    The output must be a JSON object:
                    {
                        "sections": [
                            {
                                "title": "Section Title (or 'Continued' if it's just text flow)",
                                "content": "Markdown content..."
                            }
                        ]
                    }
                    
                    If the page contains multiple short sections, include them all in the array.
                    If the page is just a Table of Contents or a Cover Page with no real instructions, return an empty array or a "Project Overview" section.
                    `
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: "Transcribe this page."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image, // base64 data url
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 4000,
            temperature: 0.1,
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content);

        // Ensure every section has a unique ID
        const sectionsWithIds = parsed.sections?.map((section: any) => ({
            ...section,
            id: crypto.randomUUID(),
        })) || [];

        return NextResponse.json({ sections: sectionsWithIds });

    } catch (error) {
        console.error('Error parsing instructions:', error);
        return NextResponse.json(
            { error: 'Failed to process instructions' },
            { status: 500 }
        );
    }
}
