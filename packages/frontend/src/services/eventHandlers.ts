import type { A2UIMessage } from '@a2ui/shared';
import { createAGUITransportHandler, type A2UITransportCallbacks } from '@a2ui/shared/transport';

/**
 * Stream callbacks for agent communication
 * These map directly to A2UI transport callbacks
 */
export interface StreamCallbacks {
  onTextDelta?: (text: string) => void;
  onA2UIMessage?: (message: A2UIMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Creates an AG-UI event handler that extracts A2UI messages
 * 
 * Architecture:
 * - AG-UI: Transport layer (handles communication, events, streaming)
 * - A2UI: Component specification (defines what to render)
 * 
 * This adapter bridges the two by extracting A2UI messages from AG-UI events
 */
export function createEventHandler(callbacks: StreamCallbacks) {
  const transportCallbacks: A2UITransportCallbacks = {
    onA2UIMessage: callbacks.onA2UIMessage,
    onTextDelta: callbacks.onTextDelta,
    onError: callbacks.onError,
    onComplete: callbacks.onComplete,
  };

  return createAGUITransportHandler(transportCallbacks);
}
