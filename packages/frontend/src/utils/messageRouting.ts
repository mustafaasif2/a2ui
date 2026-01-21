import type { A2UIMessage } from '@a2ui/shared';
import type { ChatMessage } from '../types/message';

/**
 * Routes A2UI messages to the correct message based on message type and surfaceId
 */
export function routeA2UIMessageToMessageId(
  message: A2UIMessage,
  a2uiMessagesByMessageId: Map<string, A2UIMessage[]>,
  chatMessages: ChatMessage[]
): string | null {
  // Special handling for deleteSurface: route it to the message that contains the surface being deleted
  if (message.type === 'deleteSurface' && message.surfaceId) {
    // Find the message that has a surfaceUpdate with this surfaceId
    for (const [msgId, a2uiMsgs] of a2uiMessagesByMessageId.entries()) {
      const hasMatchingSurface = a2uiMsgs.some(
        (m) => m.type === 'surfaceUpdate' && m.surfaceId === message.surfaceId
      );
      if (hasMatchingSurface) {
        console.log(`Routing deleteSurface to message ${msgId} based on surfaceId ${message.surfaceId}`);
        return msgId;
      }
    }
    
    // Fallback: try to extract messageId from surfaceId format (for backward compatibility)
    const surfaceIdMatch = message.surfaceId.match(/^surface-(msg-\d+-\d+)$/);
    if (surfaceIdMatch) {
      const extractedMessageId = surfaceIdMatch[1];
      const targetMessage = chatMessages.find(m => m.messageId === extractedMessageId);
      if (targetMessage) {
        console.log(`Routing deleteSurface to message ${extractedMessageId} (extracted from surfaceId format)`);
        return extractedMessageId;
      }
    }
    
    console.warn(`deleteSurface targets surfaceId ${message.surfaceId} but no message with that surface found`);
  }
  
  return null;
}
