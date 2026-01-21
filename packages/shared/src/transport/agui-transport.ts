/**
 * AG-UI Transport Adapter for A2UI
 * 
 * This module provides a clean abstraction layer where:
 * - AG-UI handles the transport/communication layer
 * - A2UI defines the component specification
 * 
 * The transport adapter extracts A2UI messages from AG-UI events
 * and provides a unified interface for A2UI message handling.
 */

import type { BaseEvent, ToolCallResultEvent, TextMessageChunkEvent, Message, State, RunAgentInput } from '@ag-ui/core';
import { EventType } from '@ag-ui/core';
import type { A2UIMessage, SurfaceUpdateMessage, BeginRenderingMessage } from '../types';

/**
 * AgentSubscriberParams from @ag-ui/client
 * Defined here to avoid adding @ag-ui/client as a dependency to shared package
 */
export interface AgentSubscriberParams {
  messages: Message[];
  state: State;
  agent: any;
  input: RunAgentInput;
}

/**
 * Callbacks for A2UI message handling
 */
export interface A2UITransportCallbacks {
  onA2UIMessage?: (message: A2UIMessage) => void;
  onTextDelta?: (text: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Extracts A2UI messages from AG-UI tool call result events
 * 
 * AG-UI transports A2UI messages as tool call results with the structure:
 * {
 *   message: <A2UIMessage>
 * }
 */
export function extractA2UIMessageFromAGUIEvent(
  event: BaseEvent
): A2UIMessage | null {
  if (event.type !== EventType.TOOL_CALL_RESULT) {
    return null;
  }

  try {
    const toolCallResult = event as ToolCallResultEvent;
    const parsed = JSON.parse(toolCallResult.content);
    if (parsed?.message) {
      return parsed.message as A2UIMessage;
    }
  } catch (error) {
    console.error('Failed to parse A2UI message from AG-UI event:', error);
  }

  return null;
}

/**
 * Creates an AG-UI event handler that extracts and forwards A2UI messages
 * 
 * This adapter bridges AG-UI (transport) and A2UI (component spec):
 * - Listens to AG-UI events
 * - Extracts A2UI messages from tool call results
 * - Automatically triggers beginRendering for surfaceUpdate messages
 * - Forwards text deltas and errors
 */
export function createAGUITransportHandler(
  callbacks: A2UITransportCallbacks
) {
  let assistantContent = '';

  return {
    onEvent: (params: { event: BaseEvent } & AgentSubscriberParams) => {
      const { event } = params;
      
      // Handle text message chunks (AG-UI transport layer)
      if (
        event.type === EventType.TEXT_MESSAGE_CONTENT ||
        event.type === EventType.TEXT_MESSAGE_CHUNK
      ) {
        const textEvent = event as TextMessageChunkEvent;
        if (textEvent.delta) {
          assistantContent += textEvent.delta;
          callbacks.onTextDelta?.(assistantContent);
        }
      }

      // Extract A2UI messages from AG-UI tool call results
      const a2uiMessage = extractA2UIMessageFromAGUIEvent(event);
      if (a2uiMessage) {
        callbacks.onA2UIMessage?.(a2uiMessage);

        // Automatically trigger beginRendering after surfaceUpdate
        // This is part of the A2UI protocol spec
        if (a2uiMessage.type === 'surfaceUpdate') {
          callbacks.onA2UIMessage?.({
            type: 'beginRendering',
            surfaceId: (a2uiMessage as SurfaceUpdateMessage).surfaceId || 'main',
          } as BeginRenderingMessage);
        }
      }
    },
    onRunFailed: (params: { error: Error } & AgentSubscriberParams) => {
      callbacks.onError?.(params.error);
    },
    onRunFinalized: (params: AgentSubscriberParams) => {
      callbacks.onComplete?.();
    },
  };
}

/**
 * Wraps an A2UI message for transport via AG-UI tool call result
 * 
 * This is used on the backend to properly format A2UI messages
 * for AG-UI transport
 */
export function wrapA2UIMessageForAGUITransport(
  message: A2UIMessage
): { message: A2UIMessage } {
  return { message };
}
