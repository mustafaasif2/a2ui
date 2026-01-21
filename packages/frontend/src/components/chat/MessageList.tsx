import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../contexts';
import ChatEmpty from './ChatEmpty';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSelectOption?: (option: string) => void;
}

export default function MessageList({ messages, isLoading, onSelectOption }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check if there's already an assistant message being updated
  const hasAssistantMessage = messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className="chat-messages">
      {messages.length === 0 && !isLoading ? (
        <ChatEmpty onSelectOption={onSelectOption} />
      ) : (
        <>
          {messages.map((message, index) => (
            <div key={index} className={`chat-message chat-message-${message.role}`}>
              <div className="chat-message-content">{message.content}</div>
            </div>
          ))}
          {isLoading && !hasAssistantMessage && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-message-content">
                <span className="chat-loading">Thinking</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
