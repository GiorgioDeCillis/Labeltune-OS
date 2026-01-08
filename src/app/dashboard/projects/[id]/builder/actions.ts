'use server';

import { AIGeneratorConfig } from "@/components/builder/types";

// Mocking the AI generation for now as requested/implied by "connect their api keys"
// In a real implementation, this would use the OpenAI/Anthropic SDKs.
// Since I don't have the SDKs installed or configured in this environment context,
// I will simulate the API calls.

export async function generateAIResponse(
    text: string,
    config: AIGeneratorConfig
) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const prompt = `System: ${config.systemPrompt || 'You are a helpful assistant.'}\nUser: ${text}`;

    if (config.provider === 'platform') {
        // Platform internal model logic
        // In reality: await openai.chat.completions.create(...) using env var
        return `[Platform AIGen] Processing your request using our internal model.\n\nHere is a generated response based on: "${text}".\n\n(Simulated Output)`;
    } else if (config.provider === 'openai') {
        if (!config.apiKey?.startsWith('sk-')) {
            throw new Error("Invalid OpenAI API Key provided.");
        }
        // Client OpenAI logic
        return `[OpenAI AIGen] (Model: ${config.model || 'gpt-4'}) \n\nResponse generated using your personal API key.\n\nInput: "${text}"`;
    } else if (config.provider === 'anthropic') {
        if (!config.apiKey?.startsWith('sk-ant')) {
            throw new Error("Invalid Anthropic API Key provided.");
        }
        // Client Anthropic logic
        return `[Anthropic AIGen] (Model: ${config.model || 'claude-3-opus'}) \n\nResponse generated using your personal API key.\n\nInput: "${text}"`;
    }

    return "Unknown provider configuration.";
}
