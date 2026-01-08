'use server';

import OpenAI from 'openai';
import { AIGeneratorConfig } from "@/components/builder/types";

// Initialize the platform client
// Note: client-side usage of this action ensures secrets are kept on server
const platformOpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(
    prompt: string,
    config: AIGeneratorConfig,
    referenceText?: string
) {
    try {
        const systemPrompt = config.systemPrompt || 'You are a helpful assistant.';

        // Construct the full user content with reference text if provided
        let userContent = prompt;
        if (referenceText) {
            userContent = `Reference Text:\n${referenceText}\n\nUser Request:\n${prompt}`;
        }

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ];

        let openaiClient = platformOpenAI;
        let model = config.model;

        // Configuration Logic
        if (config.provider === 'platform') {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("Platform AI is not configured (Missing API Key).");
            }
            // Default platform model if none specified
            model = 'gpt-4o';

        } else if (config.provider === 'openai') {
            if (!config.apiKey?.startsWith('sk-')) {
                throw new Error("Invalid OpenAI API Key provided.");
            }
            // Initialize a temporary client for this request with user's key
            openaiClient = new OpenAI({
                apiKey: config.apiKey,
            });
            model = config.model || 'gpt-4o';

        } else if (config.provider === 'anthropic') {
            // Placeholder: Anthropic SDK not installed yet
            throw new Error("Anthropic provider is not yet supported in this environment.");
        } else {
            throw new Error(`Unknown provider: ${config.provider}`);
        }

        // Call OpenAI API
        const completion = await openaiClient.chat.completions.create({
            model: model || 'gpt-4o',
            messages: messages,
            max_tokens: 1000,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("AI returned empty response.");
        }

        return content;

    } catch (error: any) {
        console.error("AI Generation failed:", error);
        // Return a user-friendly error string
        throw new Error(error.message || "Failed to generate response.");
    }
}
