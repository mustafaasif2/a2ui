import { AgentService } from '../agent/agentService';
import type { UserActionMessage, A2UIMessage } from '@a2ui/shared';
import { validateUserActionMessage } from '@a2ui/shared';

/**
 * Handles user actions from A2UI components
 * 
 * Per A2UI v0.8 spec, user actions must be sent back to the agent
 * via AG-UI transport with proper formatting including:
 * - name: Action name
 * - surfaceId: Surface where action occurred
 * - sourceComponentId: Component that triggered the action
 * - timestamp: ISO 8601 timestamp
 * - context: Resolved context with bound data
 */
export class ActionHandler {
  /**
   * Handle a user action from an A2UI component
   * Sends the action to the agent via AG-UI transport
   * 
   * @param action - The action to handle (already formatted per A2UI spec)
   * @param onA2UIMessage - Optional callback to handle A2UI messages from agent response
   * @param onTextDelta - Optional callback to handle text messages from agent response
   */
  static async handleAction(
    action: {
      name: string;
      sourceComponentId: string;
      surfaceId: string;
      timestamp: string;
      context?: Record<string, unknown>;
    },
    onA2UIMessage?: (message: A2UIMessage) => void,
    onTextDelta?: (text: string) => void
  ): Promise<void> {
    // Validate required fields per A2UI v0.8 spec
    if (!action.name || !action.sourceComponentId || !action.surfaceId || !action.timestamp) {
      console.error('Invalid action: missing required fields', action);
      return;
    }

    // Create UserActionMessage per A2UI v0.8 spec
    const userActionMessage: UserActionMessage = {
      type: 'userAction',
      name: action.name,
      surfaceId: action.surfaceId,
      sourceComponentId: action.sourceComponentId,
      timestamp: action.timestamp,
      context: action.context,
    };

    // Validate message structure before sending (security)
    if (!validateUserActionMessage(userActionMessage)) {
      console.error('Invalid user action message:', userActionMessage);
      return;
    }

    console.log('Sending user action to agent:', userActionMessage);
    // Send to agent via AG-UI transport and handle response
    await AgentService.sendUserAction(userActionMessage, onA2UIMessage, onTextDelta);
  }
}
