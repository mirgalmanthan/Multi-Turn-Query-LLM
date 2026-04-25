import { Request, Response } from 'express';
import { streamLLMResponse } from '../helpers/llm';
import { ApiResponse, ConversationMessage, QueryRequest } from '../structs/io';

const MAX_QUERY_LENGTH = 2000;
const VALID_ROLES = new Set(['user', 'assistant']);

export async function query(req: Request, res: Response): Promise<void> {
    const body = req.body as Partial<QueryRequest>;
    const userQuery = body.query?.trim();

    if (!userQuery) {
        const response = new ApiResponse(400, ['query field is required and cannot be empty'], {});
        res.status(400).json(response);
        return;
    }

    if (userQuery.length > MAX_QUERY_LENGTH) {
        const response = new ApiResponse(
            400,
            [`query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`],
            {}
        );
        res.status(400).json(response);
        return;
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ConversationMessage[] = rawHistory
        .filter(
            (msg): msg is ConversationMessage =>
                msg !== null &&
                typeof msg === 'object' &&
                VALID_ROLES.has(msg.role) &&
                typeof msg.content === 'string' &&
                msg.content.trim().length > 0
        )
        .map((msg) => ({ role: msg.role, content: msg.content.trim() }));

    await streamLLMResponse(userQuery, res, history);
}

