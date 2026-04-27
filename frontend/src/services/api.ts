import axios from 'axios';
import { ConversationMessage } from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;


export async function getToken(): Promise<string> {
    const res = await axios.post(`${API_URL}/api/auth/demo`);
    return res.data.payload.token as string;
}


interface StreamQueryParams {
    query: string;
    history: ConversationMessage[];
    token: string;
    onChunk: (chunk: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
}


export async function streamQuery({
    query,
    history,
    token,
    onChunk,
    onDone,
    onError,
}: StreamQueryParams): Promise<void> {
    let response: Response;

    try {
        response = await fetch(`${API_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query, history }),
        });
    } catch (err) {
        onError('Network error — could not reach the server.');
        return;
    }

    if (!response.ok) {
        onError(`Request failed with status ${response.status}.`);
        return;
    }

    if (!response.body) {
        onError('No response body received.');
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // SSE lines end with \n; split and keep any incomplete line
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const raw = line.slice('data: '.length).trim();
                if (!raw) continue;

                let event: { type: string; content?: string; message?: string };
                try {
                    event = JSON.parse(raw);
                } catch {
                    continue; 
                }

                if (event.type === 'chunk' && event.content) {
                    onChunk(event.content);
                } else if (event.type === 'done') {
                    onDone();
                    return;
                } else if (event.type === 'error') {
                    onError(event.message ?? 'Unknown error from server.');
                    return;
                }
            }
        }

        // Stream closed without explicit [done] event
        onDone();
    } catch (err) {
        onError('Stream interrupted unexpectedly.');
    } finally {
        reader.releaseLock();
    }
}
