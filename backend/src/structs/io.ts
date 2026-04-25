export class ApiResponse {
    constructor (
        public statusCode: number = 200,
        public errors: string[] = [],
        public payload: any = {}
    ) {}
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface QueryRequest {
    query: string;
    history?: ConversationMessage[];
}