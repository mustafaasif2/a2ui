/**
 * AG-UI Transport Adapter for A2UI
 * 
 * This module provides a clean abstraction layer where:
 * - AG-UI handles the transport/communication layer
 * - A2UI defines the component specification
 * 
 * The transport adapter extracts A2UI messages from AG-UI events
 * and provides a unified interface for A2UI message handling.
 * 
 * Supports bidirectional communication:
 * - Server → Client: A2UI messages via tool call results
 * - Client → Server: UserAction and Error messages via user messages
 */

import type { BaseEvent, ToolCallResultEvent, TextMessageChunkEvent, Message, State, RunAgentInput, StateSnapshotEvent, StateDeltaEvent } from '@ag-ui/core';
import { EventType } from '@ag-ui/core';
import type { A2UIMessage, SurfaceUpdateMessage, BeginRenderingMessage, UserActionMessage, ErrorMessage } from '../types';

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
  onStateSnapshot?: (state: State) => void;
  onStateDelta?: (delta: Record<string, unknown>) => void;
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
  // Check both enum and string versions of the event type
  const eventType = String(event.type);
  if (eventType !== String(EventType.TOOL_CALL_RESULT) && eventType !== 'TOOL_CALL_RESULT') {
    return null;
  }

  try {
    const toolCallResult = event as ToolCallResultEvent;
    let parsed: any;
    
    // Handle both string and already-parsed content
    if (typeof toolCallResult.content === 'string') {
      parsed = JSON.parse(toolCallResult.content);
    } else {
      parsed = toolCallResult.content;
    }
    
    if (parsed?.message) {
      const a2uiMessage = parsed.message as A2UIMessage;
      console.log('Extracted A2UI message from tool call result:', a2uiMessage);
      return a2uiMessage;
    } else {
      console.warn('Tool call result does not contain A2UI message:', parsed);
    }
  } catch (error) {
    console.error('Failed to parse A2UI message from AG-UI event:', error, event);
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
      const { event, state } = params;
      
      // Log all events for debugging
      const eventType = String(event.type);
      console.log('AG-UI Event received:', eventType, event);
      
      // Reset text accumulator when a new run starts
      if (eventType === String(EventType.RUN_STARTED) || eventType === 'RUN_STARTED') {
        assistantContent = '';
      }
      
      // Handle text message chunks (AG-UI transport layer)
      if (
        eventType === String(EventType.TEXT_MESSAGE_CONTENT) ||
        eventType === String(EventType.TEXT_MESSAGE_CHUNK) ||
        eventType === 'TEXT_MESSAGE_CONTENT' ||
        eventType === 'TEXT_MESSAGE_CHUNK'
      ) {
        const textEvent = event as TextMessageChunkEvent;
        if (textEvent.delta) {
          assistantContent += textEvent.delta;
          callbacks.onTextDelta?.(assistantContent);
        }
      }

      // Handle AG-UI state synchronization events
      if (eventType === String(EventType.STATE_SNAPSHOT) || eventType === 'STATE_SNAPSHOT') {
        const snapshotEvent = event as StateSnapshotEvent;
        callbacks.onStateSnapshot?.(snapshotEvent.state || state);
      }

      if (eventType === String(EventType.STATE_DELTA) || eventType === 'STATE_DELTA') {
        const deltaEvent = event as StateDeltaEvent;
        const delta = deltaEvent.delta;
        // Handle both object and array deltas - only pass object deltas
        if (delta && typeof delta === 'object' && !Array.isArray(delta)) {
          callbacks.onStateDelta?.(delta as Record<string, unknown>);
        }
      }

      // Extract A2UI messages from AG-UI tool call results
      // Check both enum and string versions
      if (eventType === String(EventType.TOOL_CALL_RESULT) || eventType === 'TOOL_CALL_RESULT') {
        console.log('Processing TOOL_CALL_RESULT event:', event);
        const a2uiMessage = extractA2UIMessageFromAGUIEvent(event);
        if (a2uiMessage) {
          console.log('Calling onA2UIMessage callback with:', a2uiMessage);
          callbacks.onA2UIMessage?.(a2uiMessage);

          // Automatically trigger beginRendering after surfaceUpdate
          // This is part of the A2UI protocol spec
          if (a2uiMessage.type === 'surfaceUpdate') {
            const surfaceUpdate = a2uiMessage as SurfaceUpdateMessage;
            const beginRenderingMessage: BeginRenderingMessage = {
              type: 'beginRendering',
              surfaceId: surfaceUpdate.surfaceId || 'main',
              root: surfaceUpdate.root, // Include root per spec
            };
            console.log('Triggering beginRendering:', beginRenderingMessage);
            callbacks.onA2UIMessage?.(beginRenderingMessage);
          }
        } else {
          console.warn('Failed to extract A2UI message from TOOL_CALL_RESULT event');
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

/**
 * Formats a UserAction or Error message for transport via AG-UI user message
 * 
 * Per A2UI spec, client-to-server messages (userAction, error) are sent
 * as user messages with a special format that the agent can parse.
 * 
 * Format: JSON string with type indicator and message payload
 */
export function formatA2UIMessageForAGUIUserMessage(
  message: UserActionMessage | ErrorMessage
): string {
  return JSON.stringify({
    type: 'a2ui',
    message,
  });
}

/**
 * Parses an A2UI message from an AG-UI user message
 * 
 * Extracts UserAction or Error messages sent from client to server
 */
export function parseA2UIMessageFromAGUIUserMessage(
  content: string
): UserActionMessage | ErrorMessage | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === 'a2ui' && parsed?.message) {
      const message = parsed.message;
      if (message.type === 'userAction' || message.type === 'error') {
        return message as UserActionMessage | ErrorMessage;
      }
    }
  } catch (error) {
    // Not an A2UI message, return null
  }
  return null;
}
