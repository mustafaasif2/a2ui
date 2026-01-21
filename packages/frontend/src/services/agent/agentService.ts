import { HttpAgent, randomUUID } from '@ag-ui/client';
import { API_CONFIG } from '../../config/constants';
import { createEventHandler } from '../events/eventHandlers';
import { formatA2UIMessageForAGUIUserMessage } from '@a2ui/shared/transport';
import type { UserActionMessage, ErrorMessage, A2UIMessage } from '@a2ui/shared';
import type { StreamCallbacks, RetryOptions } from './types';

const agUiAgent = new HttpAgent({
  url: `${API_CONFIG.BASE_URL}/api/agents/${API_CONFIG.AGENT_ID}/run`,
});

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  onRetry: () => {},
};

export class AgentService {
  private static pendingMessages: Array<{ id: string; role: 'user'; content: string }> = [];
  private static isConnected = false;

  /**
   * Streams agent response with automatic retry and reconnection support
   * Implements transport resilience per AG-UI best practices
   */
  static async streamAgentResponse(
    userMessage: string,
    callbacks: StreamCallbacks,
    retryOptions: RetryOptions = {}
  ): Promise<void> {
    const options = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
    const message = {
      id: randomUUID(),
      role: 'user' as const,
      content: userMessage,
    };

    // Store message for potential retry (already has id from randomUUID())
    AgentService.pendingMessages.push(message);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          options.onRetry(attempt);
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, options.retryDelay * attempt));
        }

        // Add message to agent
        agUiAgent.addMessage(message);

        // Create event handler with error recovery
        const eventHandler = createEventHandler({
          ...callbacks,
          onError: (error) => {
            lastError = error;
            callbacks.onError?.(error);
          },
        });

        AgentService.isConnected = true;
        await agUiAgent.runAgent({}, eventHandler);
        AgentService.isConnected = false;

        // Success - remove from pending
        AgentService.pendingMessages = AgentService.pendingMessages.filter(m => m !== message);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        AgentService.isConnected = false;

        if (attempt < options.maxRetries) {
          console.warn(`Agent request failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying...`, error);
          continue;
        } else {
          // Final failure - remove from pending and report error
          AgentService.pendingMessages = AgentService.pendingMessages.filter(m => m !== message);
          callbacks.onError?.(lastError);
          throw lastError;
        }
      }
    }
  }

  /**
   * Sends a UserAction message back to the agent via AG-UI transport
   * Per A2UI v0.8 spec, user actions must be sent to the agent
   * 
   * This actually runs the agent with the action message so it gets processed
   * 
   * @param action - The user action message to send
   * @param onA2UIMessage - Optional callback to handle A2UI messages from agent response
   */
  static async sendUserAction(
    action: UserActionMessage,
    onA2UIMessage?: (message: A2UIMessage) => void,
    onTextDelta?: (text: string) => void
  ): Promise<void> {
    const formattedMessage = formatA2UIMessageForAGUIUserMessage(action);
    const message: { id: string; role: 'user'; content: string } = {
      id: randomUUID(),
      role: 'user',
      content: formattedMessage,
    };

    try {
      // Add message to agent
      agUiAgent.addMessage(message);
      
      // Create event handler to process agent response
      const eventHandler = createEventHandler({
        onA2UIMessage: (a2uiMessage) => {
          // If agent responds with A2UI messages (e.g., UI updates), handle them
          if (onA2UIMessage) {
            onA2UIMessage(a2uiMessage);
          }
          console.log('Agent responded to action with A2UI message:', a2uiMessage);
        },
        onTextDelta: (text) => {
          // Agent might respond with text feedback
          if (onTextDelta) {
            onTextDelta(text);
          }
          console.log('Agent response:', text);
        },
        onError: (error) => {
          console.error('Error processing user action:', error);
        },
        onComplete: () => {
          console.log('User action processed');
        },
      });

      // Actually run the agent to send the message and get response
      AgentService.isConnected = true;
      await agUiAgent.runAgent({}, eventHandler);
      AgentService.isConnected = false;
    } catch (error) {
      AgentService.isConnected = false;
      console.error('Failed to send user action:', error);
      // Queue for retry on next connection
      AgentService.pendingMessages.push(message);
    }
  }

  /**
   * Sends an Error message back to the server via AG-UI transport
   * Per A2UI v0.8 spec, client-side errors should be reported to the server
   * 
   * If not connected, queues the message for retry
   */
  static sendError(error: ErrorMessage): void {
    const formattedMessage = formatA2UIMessageForAGUIUserMessage(error);
    const message: { id: string; role: 'user'; content: string } = {
      id: randomUUID(),
      role: 'user',
      content: formattedMessage,
    };

    try {
      agUiAgent.addMessage(message);
      AgentService.isConnected = true;
    } catch (error) {
      console.warn('Failed to send error message, queueing for retry:', error);
      // Queue for retry on next connection
      AgentService.pendingMessages.push(message);
    }
  }

  /**
   * Retries sending pending messages
   * Called automatically on reconnection or can be called manually
   */
  static async retryPendingMessages(): Promise<void> {
    if (AgentService.pendingMessages.length === 0) {
      return;
    }

    const messages = [...AgentService.pendingMessages];
    AgentService.pendingMessages = [];

    for (const message of messages) {
      try {
        agUiAgent.addMessage(message);
      } catch (error) {
        console.warn('Failed to retry pending message:', error);
        // Re-queue if still failing
        AgentService.pendingMessages.push(message);
      }
    }
  }

  /**
   * Gets connection status
   */
  static getConnectionStatus(): boolean {
    return AgentService.isConnected;
  }
}
