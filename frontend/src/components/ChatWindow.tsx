import { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';

interface ChatWindowProps {
    messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-window">
            {messages.length === 0 && (
                <p className="chat-empty">Ask a GIS question to get started.</p>
            )}
            {messages.map((msg) => (
                <MessageComponent key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
