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
                    content: `You are an expert technical writer and document parser. Your goal is to transcribe the visible text from the provided image into clean, structured Markdown.

RULES:
1. **Tables**: Verify if there are any tables. If so, transcribe them using proper GitHub Flavored Markdown (GFM) table syntax. Ensure headers and separators are correct.
2. **Watermarks/Artifacts**: Ignore any watermarks, page numbers, or running headers/footers. Do not transcribe them.
3. **Images**: Do NOT describe images. Do NOT put placeholders like *[Image: ...]*. Ignore visual elements unless they contain essential text instructions.
4. **Structure**:
    - Use H1 (#) for the main page title if present.
    - Use H2 (##) and H3 (###) for subsections.
    - Maintain the logical flow of text.
    - Do NOT start with "Here is the transcription..." or "This page contains...". Just output the content.
5. **Emojis**: Preserve all emojis found in the text.
6. **Formatting**: Use bold, italic, and lists to match the visual hierarchy.
7. **JSON Output**: You MUST return the result in this JSON format:
   {
     "sections": [
       {
         "title": "Section Title (or 'Continued' if it's a continuation)",
         "content": "Markdown content..."
       }
     ]
   }
   
   If the page is empty or contains no useful instruction text, return an empty array for sections.`
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
