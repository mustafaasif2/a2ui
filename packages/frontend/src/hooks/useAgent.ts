import { useState, useCallback, useRef } from 'react';
import type { A2UIMessage } from '@a2ui/shared';
import { AgentService } from '../services/agent/agentService';
import { useMessages } from '../contexts';

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const { addChatMessage, updateLastChatMessage, addA2UIMessage } = useMessages();
  const currentAssistantMessageIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    currentAssistantMessageIdRef.current = null;
    addChatMessage({ role: 'user', content: userMessage });

    try {
      await AgentService.streamAgentResponse(userMessage, {
        onTextDelta: (text) => {
          // Update the last message and capture its ID
          updateLastChatMessage(text);
          // Get the messageId from the context - we'll need to track it
          // For now, we'll rely on addA2UIMessage to find it
        },
        onA2UIMessage: (message: A2UIMessage) => {
          console.log('Received A2UI message in useAgent:', message);
          // Pass the current assistant message ID if we have it
          addA2UIMessage(message, currentAssistantMessageIdRef.current || undefined);
        },
        onError: () => {
          updateLastChatMessage('Sorry, I encountered an error. Please try again.');
          setIsLoading(false);
        },
        onComplete: () => {
          console.log('Agent response complete');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      setIsLoading(false);
      updateLastChatMessage('Sorry, I encountered an error. Please try again.');
    }
  }, [addChatMessage, updateLastChatMessage, addA2UIMessage]);

  return { sendMessage, isLoading };
}
