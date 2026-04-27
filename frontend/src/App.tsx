import { useEffect, useRef, useState } from 'react';
import { Message, ConversationMessage } from './types';
import { getToken, streamQuery } from './services/api';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import './index.css';

export default function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [token, setToken] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    const messagesRef = useRef<Message[]>([]);
    messagesRef.current = messages;

    useEffect(() => {
        getToken()
            .then((t) => {
                setToken(t);
                setStatus('ready');
            })
            .catch(() => setStatus('error'));
    }, []);

    function handleReset() {
        setMessages([]);
    }

    async function handleSubmit(query: string) {
        if (!token || isStreaming) return;

        // Build history from current messages (exclude any still-streaming placeholder)
        const history: ConversationMessage[] = messagesRef.current
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, content: m.content }));

        // Add user message
        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: query,
        };

        // Add blank assistant placeholder that will be filled by chunks
        const assistantId = crypto.randomUUID();
        const assistantPlaceholder: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
        setIsStreaming(true);

        await streamQuery({
            query,
            history,
            token,
            onChunk: (chunk) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId ? { ...m, content: m.content + chunk } : m
                    )
                );
            },
            onDone: () => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId ? { ...m, isStreaming: false } : m
                    )
                );
                setIsStreaming(false);
            },
            onError: (message) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? { ...m, content: `Error: ${message}`, isStreaming: false, isError: true }
                            : m
                    )
                );
                setIsStreaming(false);
            },
        });
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>GIS Query Assistant</h1>
                <span className="app-status">
                    {status === 'loading' && 'Connecting…'}
                    {status === 'ready' && 'Ready'}
                    {status === 'error' && '⚠ Auth failed — check backend'}
                </span>
            </header>

            <ChatWindow messages={messages} />

            <MessageInput
                onSubmit={handleSubmit}
                onReset={handleReset}
                isStreaming={isStreaming}
            />
        </div>
    );
}
