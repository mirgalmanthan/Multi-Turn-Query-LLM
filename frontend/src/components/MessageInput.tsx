import { useRef, useState, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSubmit: (query: string) => void;
    onReset: () => void;
    isStreaming: boolean;
}

export default function MessageInput({ onSubmit, onReset, isStreaming }: MessageInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleSubmit() {
        const trimmed = value.trim();
        if (!trimmed || isStreaming) return;
        onSubmit(trimmed);
        setValue('');
        textareaRef.current?.focus();
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        // Enter submits; Shift+Enter inserts a newline
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="input-area">
            <div className="input-row">
                <textarea
                    ref={textareaRef}
                    id="query-input"
                    rows={2}
                    placeholder="Ask a GIS question… (Enter to send, Shift+Enter for newline)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming}
                    aria-label="Query input"
                />
                <button
                    id="send-btn"
                    className="btn-send"
                    onClick={handleSubmit}
                    disabled={isStreaming || !value.trim()}
                    aria-label="Send query"
                >
                    {isStreaming ? 'Sending…' : 'Send'}
                </button>
            </div>
            <button
                id="reset-btn"
                className="btn-reset"
                onClick={onReset}
                aria-label="Reset conversation"
            >
                Reset conversation
            </button>
        </div>
    );
}
