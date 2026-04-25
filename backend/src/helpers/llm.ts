import * as dotenv from 'dotenv';
import { Response } from 'express';
import { OpenAIProvider } from '../llm/OpenAIProvider';
import { GIS_SYSTEM_PROMPT } from '../prompts';
import { ConversationMessage } from '../structs/io';

dotenv.config();

const provider = new OpenAIProvider({
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    systemPrompt: GIS_SYSTEM_PROMPT,
    conversationWindow: Number(process.env.CONVERSATION_WINDOW) || 10,
});

export async function streamLLMResponse(
    query: string,
    res: Response,
    history: ConversationMessage[] = []
): Promise<void> {
    await provider.stream(query, history, res);
}

