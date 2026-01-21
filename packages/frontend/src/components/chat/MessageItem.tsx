import { useMemo } from 'react';
import { A2UIRenderer } from '@a2ui/shared/react';
import type { ChatMessage } from '../../types/message';
import type { A2UIMessage } from '@a2ui/shared';
import type { ComponentRegistry } from '@a2ui/shared/react';
import { hasNonDeleteMessages } from '../../utils/messageGrouping';

interface MessageItemProps {
  message: ChatMessage;
  hasA2UI: boolean;
  a2uiMessages: A2UIMessage[];
  surfaceId: string;
  componentRegistry?: ComponentRegistry;
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void;
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void;
  showTextMessage?: boolean;
  isActionLoading?: boolean;
}

/**
 * Renders a single message item with optional A2UI content
 * Separate component to isolate re-renders
 */
export default function MessageItem({
  message,
  hasA2UI,
  a2uiMessages,
  surfaceId,
  componentRegistry,
  onAction,
  onError,
  showTextMessage = true,
  isActionLoading = false,
}: MessageItemProps) {
  // Memoize adapted messages to prevent unnecessary re-renders
  // Use JSON stringify for deep comparison since array reference changes
  // Include all messages (including deleteSurface) so useSurfaceState can handle them
  // useSurfaceState will process deleteSurface to clear the surface state
  // IMPORTANT: For deleteSurface messages, preserve the original surfaceId from the message
  // For other messages, use the message's surfaceId (which will be overridden to match this message's surfaceId)
  const adaptedA2UIMessages = useMemo(() => {
    // Sort messages to ensure proper order per A2UI spec: surfaceUpdate before beginRendering
    // Per A2UI v0.8 spec: surfaceUpdate and dataModelUpdate must come before beginRendering
    const sortedMessages = [...a2uiMessages].sort((a, b) => {
      const order = { surfaceUpdate: 0, dataModelUpdate: 1, beginRendering: 2, deleteSurface: 3 };
      return (order[a.type as keyof typeof order] ?? 99) - (order[b.type as keyof typeof order] ?? 99);
    });
    
    // Per A2UI spec: All messages for a surface must use the SAME surfaceId as sent by backend
    // We should NOT override surfaceIds - the backend must send correct ones
    // Exception: deleteSurface targets a specific surface, so we route it but don't change its surfaceId
    const adapted = sortedMessages.map(msg => {
      // For deleteSurface, preserve the original surfaceId (it targets a specific surface)
      if (msg.type === 'deleteSurface') {
        return msg; // Keep original surfaceId - it targets a specific surface
      }
      // For other messages: Use the surfaceId as sent by backend
      // If backend sent "main" or "auto", we need to handle it, but ideally backend should send unique IDs
      // For now, if surfaceId is "main" or "auto", map it to this message's surfaceId
      // This is a workaround until backend generates proper unique surfaceIds
      if (msg.surfaceId === 'main' || msg.surfaceId === 'auto') {
        console.warn(`MessageItem ${message.messageId}: Backend sent surfaceId "${msg.surfaceId}" - mapping to message surfaceId ${surfaceId}. Backend should generate unique surfaceIds.`);
        return {
          ...msg,
          surfaceId: surfaceId,
        };
      }
      // Use the surfaceId as sent by backend (per spec requirement)
      return msg;
    });
    console.log(`MessageItem ${message.messageId}: Processed ${a2uiMessages.length} messages (sorted and validated):`, adapted);
    return adapted;
  }, [JSON.stringify(a2uiMessages), surfaceId, message.messageId]);

  return (
    <div>
      {showTextMessage && (
        <div className={`chat-message chat-message-${message.role}`}>
          <div className="chat-message-content">
            {message.content && (
              <div className="chat-message-text">{message.content}</div>
            )}
          </div>
        </div>
      )}
      {hasA2UI && message.role === 'assistant' && (() => {
        // Check if surface has any non-delete messages (deleteSurface alone shouldn't render a container)
        const hasNonDelete = hasNonDeleteMessages(adaptedA2UIMessages);
        if (!hasNonDelete) {
          return null;
        }
        
        return (
          <div className="chat-message chat-message-assistant chat-message-a2ui-container">
            <div className="chat-message-content chat-message-a2ui">
              <A2UIRenderer
                key={`a2ui-${message.messageId}-${surfaceId}`}
                messages={adaptedA2UIMessages}
                componentRegistry={componentRegistry!}
                defaultSurfaceId={surfaceId}
                surfaceId={surfaceId}
                onAction={onAction}
                onError={onError}
                className="chat-a2ui-renderer"
                isActionLoading={isActionLoading}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
