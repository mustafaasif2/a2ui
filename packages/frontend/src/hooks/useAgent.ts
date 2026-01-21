import { useState, useCallback } from 'react';
import type { A2UIMessage } from '@a2ui/shared';
import { AgentService } from '../services';
import { useMessages } from '../contexts';

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const { addChatMessage, updateLastChatMessage, addA2UIMessage } = useMessages();

  const sendMessage = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    addChatMessage({ role: 'user', content: userMessage });

    try {
      await AgentService.streamAgentResponse(userMessage, {
        onTextDelta: (text) => updateLastChatMessage(text),
        onA2UIMessage: (message: A2UIMessage) => addA2UIMessage(message),
        onError: () => {
          updateLastChatMessage('Sorry, I encountered an error. Please try again.');
          setIsLoading(false);
        },
        onComplete: () => setIsLoading(false),
      });
    } catch {
      setIsLoading(false);
      updateLastChatMessage('Sorry, I encountered an error. Please try again.');
    }
  }, [addChatMessage, updateLastChatMessage, addA2UIMessage]);

  return { sendMessage, isLoading };
}
