import { Request, Response } from 'express';
import { streamLLMResponse } from '../helpers/llm';
import { ApiResponse, QueryRequest } from '../structs/io';

const MAX_QUERY_LENGTH = 2000;


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

    // --- Stream LLM response as SSE ---
    await streamLLMResponse(userQuery, res);
}
