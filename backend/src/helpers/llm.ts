import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Response } from 'express';
import { GIS_SYSTEM_PROMPT } from '../prompts';

dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';


export async function streamLLMResponse(query: string, res: Response): Promise<void> {
    // Set SSE headers — takes over the response for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx proxy buffering if present
    res.flushHeaders();

    try {
        const stream = await openai.chat.completions.create({
            model: LLM_MODEL,
            messages: [
                { role: 'system', content: GIS_SYSTEM_PROMPT },
                { role: 'user', content: query },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
            }
        }

        // Signal end of stream
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown LLM error';
        console.error('[LLM] Stream error:', message);

        // Emit error event over SSE then close
        res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
        res.end();
    }
}
