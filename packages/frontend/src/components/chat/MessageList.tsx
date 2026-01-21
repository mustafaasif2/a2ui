import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/message';
import type { A2UIMessage } from '@a2ui/shared';
import type { ComponentRegistry } from '@a2ui/shared/react';
import ChatEmpty from './ChatEmpty';
import MessageGroup from './MessageGroup';
import { hasNonDeleteMessages } from '../../utils/messageGrouping';

interface MessageListProps {
  messages: ChatMessage[];
  getA2UIMessagesForMessage: (messageId: string) => A2UIMessage[];
  isLoading?: boolean;
  onSelectOption?: (option: string) => void;
  componentRegistry?: ComponentRegistry;
  defaultSurfaceId?: string;
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void;
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void;
  actionLoadingStates?: Map<string, boolean>;
}

export default function MessageList({ 
  messages, 
  getA2UIMessagesForMessage,
  isLoading, 
  onSelectOption,
  componentRegistry,
  defaultSurfaceId = 'main',
  onAction,
  onError,
  actionLoadingStates = new Map(),
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Only scroll when new messages are added, not on every render
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages.length, isLoading]);

  // Check if there's already an assistant message being updated
  const hasAssistantMessage = messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className="chat-messages" ref={messagesContainerRef}>
      {messages.length === 0 && !isLoading ? (
        <ChatEmpty onSelectOption={onSelectOption} />
      ) : (
        <>
          {messages.map((message, index) => {
            const a2uiMessages = message.messageId ? getA2UIMessagesForMessage(message.messageId) : [];
            // Ensure a2uiMessages is always an array
            const safeA2uiMessages = Array.isArray(a2uiMessages) ? a2uiMessages : [];

            // Check if message has any non-deleteSurface A2UI messages
            const hasNonDelete = hasNonDeleteMessages(safeA2uiMessages);
            const shouldShowA2UI = Boolean(
              message.role === 'assistant' && 
              safeA2uiMessages.length > 0 && 
              componentRegistry
            );

            if (message.messageId && safeA2uiMessages.length > 0) {
              console.log(`MessageList: Message ${message.messageId} has ${safeA2uiMessages.length} A2UI messages:`, {
                messageId: message.messageId,
                totalMessages: safeA2uiMessages.length,
                hasNonDelete,
                shouldShowA2UI,
              });
            }

            return (
              <MessageGroup
                key={message.messageId || `msg-${index}`}
                message={message}
                a2uiMessages={safeA2uiMessages}
                componentRegistry={componentRegistry}
                defaultSurfaceId={defaultSurfaceId}
                onAction={onAction}
                onError={onError}
                actionLoadingStates={actionLoadingStates}
                shouldShowA2UI={shouldShowA2UI}
              />
            );
          })}
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
