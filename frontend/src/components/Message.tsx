import { Message } from '../types';

interface MessageProps {
    message: Message;
}

export default function MessageComponent({ message }: MessageProps) {
    const { role, content, isStreaming, isError } = message;

    return (
        <div className={`message ${role}`}>
            <span className="message-role">{role === 'user' ? 'You' : 'Assistant'}</span>
            <div className={`message-bubble${isError ? ' error' : ''}`}>
                {content}
                {isStreaming && <span className="cursor" aria-hidden="true" />}
            </div>
        </div>
    );
}
