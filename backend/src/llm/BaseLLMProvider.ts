import { Response } from 'express';
import { ConversationMessage } from '../structs/io';

export interface LLMProviderConfig {
    model: string;
    systemPrompt: string;
    conversationWindow: number;
}

export abstract class BaseLLMProvider {
    protected readonly model: string;
    protected readonly systemPrompt: string;
    protected readonly conversationWindow: number;

    constructor(config: LLMProviderConfig) {
        this.model = config.model;
        this.systemPrompt = config.systemPrompt;
        this.conversationWindow = config.conversationWindow;
    }

    abstract stream(query: string, history: ConversationMessage[], res: Response): Promise<void>;


    protected applyWindow(history: ConversationMessage[]): ConversationMessage[] {
        return history.slice(-this.conversationWindow);
    }

    protected setSSEHeaders(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }

    protected writeChunk(res: Response, content: string): void {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
    }

    protected writeDone(res: Response): void {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    }

    protected writeError(res: Response, message: string): void {
        res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
        res.end();
    }
}
