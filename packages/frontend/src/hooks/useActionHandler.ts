import { useState, useCallback } from 'react';
import { ActionHandler } from '../services/actions/actionHandler';
import { useMessages } from '../contexts';
import type { A2UIMessage } from '@a2ui/shared';

/**
 * Custom hook for handling user actions from A2UI components
 * Manages loading states per surface and coordinates action processing
 */
export function useActionHandler() {
  const { addA2UIMessage, updateLastChatMessage, clearA2UIMessageIdRef } = useMessages();
  const [actionLoadingStates, setActionLoadingStates] = useState<Map<string, boolean>>(new Map());

  const handleAction = useCallback(async (action: {
    name: string;
    sourceComponentId: string;
    surfaceId: string;
    timestamp: string;
    context?: Record<string, unknown>;
  }) => {
    // Set loading state for this surface
    setActionLoadingStates(prev => {
      const next = new Map(prev);
      next.set(action.surfaceId, true);
      return next;
    });
    
    // Clear the A2UI messageId ref when a user action starts
    // This ensures form submissions create NEW messages for the response
    // Note: We don't clear streaming ref here - it will be set when A2UI creates a message
    // and should persist for text streaming to update the same message
    clearA2UIMessageIdRef();
    
    try {
      await ActionHandler.handleAction(
        action,
        (a2uiMessage) => {
          // Pass undefined so a new assistant message is created for the response
          addA2UIMessage(a2uiMessage);
        },
        (text) => {
          // Also handle text messages from agent response (e.g., "Your form has been submitted successfully!")
          // This will update the message created by A2UI (via streaming ref)
          updateLastChatMessage(text);
        }
      );
    } finally {
      // Clear loading state when action completes
      setActionLoadingStates(prev => {
        const next = new Map(prev);
        next.set(action.surfaceId, false);
        return next;
      });
    }
  }, [addA2UIMessage, updateLastChatMessage, clearA2UIMessageIdRef]);

  return {
    handleAction,
    actionLoadingStates,
  };
}
