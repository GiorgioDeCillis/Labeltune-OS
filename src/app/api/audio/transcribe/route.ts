import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Buffer } from 'buffer';

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
        const { audio } = body; // Base64 audio string (data:audio/webm;base64,...)

        if (!audio || typeof audio !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: "audio" field (base64) is required' },
                { status: 400 }
            );
        }

        // Remove prefix if exists
        const base64Data = audio.includes('base64,') ? audio.split('base64,')[1] : audio;
        const buffer = Buffer.from(base64Data, 'base64');

        // Whisper requires a file-like object with a name and type
        const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
        });

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error('Error transcribing audio:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
