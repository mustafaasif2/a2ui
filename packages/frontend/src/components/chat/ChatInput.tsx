import { useState, FormEvent } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || disabled) return;

    onSubmit(trimmedInput);
    setInput('');
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="chat-input"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="chat-send-button"
        aria-label="Send message"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '0.375rem' }}
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Send
      </button>
    </form>
  );
}
