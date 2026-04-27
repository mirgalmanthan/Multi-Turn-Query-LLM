export type Role = 'user' | 'assistant';

export interface Message {
    id: string;
    role: Role;
    content: string;
    isStreaming?: boolean;
    isError?: boolean;
}

export interface ConversationMessage {
    role: Role;
    content: string;
}
