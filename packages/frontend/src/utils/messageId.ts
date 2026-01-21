/**
 * Utility functions for generating and managing message IDs
 */

let messageIdCounter = 0;

export function generateMessageId(): string {
  return `msg-${Date.now()}-${messageIdCounter++}`;
}

export function extractMessageIdFromSurfaceId(surfaceId: string): string | null {
  const match = surfaceId.match(/^surface-(msg-\d+-\d+)$/);
  return match ? match[1] : null;
}
