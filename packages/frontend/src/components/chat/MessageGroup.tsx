import type { ChatMessage } from '../../types/message';
import type { A2UIMessage } from '@a2ui/shared';
import type { ComponentRegistry } from '@a2ui/shared/react';
import MessageItem from './MessageItem';
import { groupMessagesBySurfaceId } from '../../utils/messageGrouping';

interface MessageGroupProps {
  message: ChatMessage;
  a2uiMessages: A2UIMessage[];
  componentRegistry?: ComponentRegistry;
  defaultSurfaceId: string;
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void;
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void;
  actionLoadingStates?: Map<string, boolean>;
  shouldShowA2UI: boolean;
}

/**
 * Renders a message group with text and A2UI surfaces
 * Handles grouping messages by surfaceId and rendering one A2UIRenderer per surface
 */
export default function MessageGroup({
  message,
  a2uiMessages,
  componentRegistry,
  defaultSurfaceId,
  onAction,
  onError,
  actionLoadingStates = new Map(),
  shouldShowA2UI,
}: MessageGroupProps) {
  // Group A2UI messages by surfaceId - each surfaceId needs its own A2UIRenderer
  const messagesBySurfaceId = groupMessagesBySurfaceId(
    a2uiMessages,
    defaultSurfaceId,
    message.messageId
  );
  
  const actualSurfaceIds = Array.from(messagesBySurfaceId.keys());
  
  // If no surfaces found, just render the text message
  if (actualSurfaceIds.length === 0) {
    return (
      <div key={message.messageId || `msg-${message.messageId}`}>
        <div className={`chat-message chat-message-${message.role}`}>
          <div className="chat-message-content">
            {message.content && (
              <div className="chat-message-text">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render text message once, then render one A2UI surface per surfaceId
  return (
    <div key={message.messageId || `msg-${message.messageId}`} className="chat-message-group">
      {/* Render text message once */}
      {message.content && (
        <div className={`chat-message chat-message-${message.role}`}>
          <div className="chat-message-content">
            <div className="chat-message-text">{message.content}</div>
          </div>
        </div>
      )}
      {/* Render A2UI surfaces - one per surfaceId */}
      {actualSurfaceIds.map((surfaceId) => {
        const messagesForSurface = messagesBySurfaceId.get(surfaceId) || [];
        return (
          <MessageItem
            key={`${message.messageId || `msg-${message.messageId}`}-${surfaceId}`}
            message={message}
            hasA2UI={shouldShowA2UI}
            a2uiMessages={messagesForSurface}
            surfaceId={surfaceId}
            componentRegistry={componentRegistry}
            onAction={onAction}
            onError={onError}
            showTextMessage={false}
            isActionLoading={actionLoadingStates.get(surfaceId) || false}
          />
        );
      })}
    </div>
  );
}
