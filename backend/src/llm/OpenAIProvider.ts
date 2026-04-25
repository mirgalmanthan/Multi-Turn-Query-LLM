import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Response } from 'express';
import { BaseLLMProvider, LLMProviderConfig } from './BaseLLMProvider';
import { ConversationMessage } from '../structs/io';

dotenv.config();

export class OpenAIProvider extends BaseLLMProvider {
    private readonly openai: OpenAI;

    constructor(config: LLMProviderConfig) {
        super(config);
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async stream(query: string, history: ConversationMessage[], res: Response): Promise<void> {
        const windowedHistory = this.applyWindow(history);
        this.setSSEHeaders(res);

        try {
            const completionStream = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...windowedHistory,
                    { role: 'user', content: query },
                ],
                stream: true,
            });

            for await (const chunk of completionStream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    this.writeChunk(res, content);
                }
            }

            this.writeDone(res);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown LLM error';
            console.error(`[${this.constructor.name}] Stream error:`, message);
            this.writeError(res, message);
        }
    }
}
