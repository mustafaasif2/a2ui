import type { A2UIMessage } from '@a2ui/shared';

/**
 * Groups A2UI messages by surfaceId
 * Per A2UI spec: Each surface is independent and must be rendered separately
 */
export function groupMessagesBySurfaceId(
  messages: A2UIMessage[],
  defaultSurfaceId: string,
  messageId?: string
): Map<string, A2UIMessage[]> {
  const messagesBySurfaceId = new Map<string, A2UIMessage[]>();
  
  messages.forEach(msg => {
    // For deleteSurface, use its target surfaceId
    // For other messages, use their surfaceId
    const msgSurfaceId = msg.surfaceId || (messageId ? `surface-${messageId}` : defaultSurfaceId);
    if (!messagesBySurfaceId.has(msgSurfaceId)) {
      messagesBySurfaceId.set(msgSurfaceId, []);
    }
    messagesBySurfaceId.get(msgSurfaceId)!.push(msg);
  });
  
  return messagesBySurfaceId;
}

/**
 * Checks if messages contain any non-deleteSurface messages
 */
export function hasNonDeleteMessages(messages: A2UIMessage[]): boolean {
  return messages.some(msg => msg.type !== 'deleteSurface');
}
