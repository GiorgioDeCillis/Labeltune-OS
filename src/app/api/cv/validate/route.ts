import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure this runs on Node.js runtime for OpenAI SDK
export const runtime = 'nodejs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Handle preflight CORS requests
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
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
                    content: `You are an expert document classifier. Your task is to determine if the provided image is a valid Curriculum Vitae (CV) or Resume.

A VALID CV/Resume should contain MOST of these elements:
- Personal information (name, contact details like email/phone)
- Work experience or employment history
- Education or academic background
- Skills, competencies, or certifications
- Professional summary, objective, or profile

INVALID documents include:
- Invoices, receipts, or bills
- Random articles, news, or blog posts
- Blank or nearly blank pages
- Academic papers or research documents (unless clearly a CV)
- ID cards, certificates alone, or unrelated forms
- Cover letters (these are NOT CVs)

Analyze the document carefully. Return your response in this exact JSON format:
{
  "isValid": true or false,
  "reason": "Brief explanation in Italian (1-2 sentences max)"
}

Be strict but fair. If it looks like a genuine attempt at a CV but is poorly formatted, consider it valid.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: "Analyze this document and determine if it is a valid CV/Resume."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.1,
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content);

        return NextResponse.json({
            isValid: parsed.isValid === true,
            reason: parsed.reason || (parsed.isValid ? 'CV valido' : 'Documento non riconosciuto come CV')
        });

    } catch (error: any) {
        console.error('Error validating CV:', error?.message || error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            {
                error: 'Failed to validate CV',
                details: error?.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
