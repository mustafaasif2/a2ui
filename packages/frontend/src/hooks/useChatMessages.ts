import { useCallback } from 'react';
import type { ChatMessage } from '../types/message';
import { generateMessageId } from '../utils/messageId';

interface UseChatMessagesParams {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  messageIdCounter: number;
  setMessageIdCounter: React.Dispatch<React.SetStateAction<number>>;
  chatMessagesRef: React.MutableRefObject<ChatMessage[]>;
  currentA2UIMessageIdRef: React.MutableRefObject<string | null>;
  streamingMessageIdRef: React.MutableRefObject<string | null>;
}

/**
 * Custom hook for chat message operations
 */
export function useChatMessages({
  chatMessages,
  setChatMessages,
  messageIdCounter,
  setMessageIdCounter,
  chatMessagesRef,
  currentA2UIMessageIdRef,
  streamingMessageIdRef,
}: UseChatMessagesParams) {
  const addChatMessage = useCallback((message: ChatMessage) => {
    // Clear the A2UI messageId ref when a new user message is sent
    // This ensures each conversation turn gets a fresh assistant message
    if (message.role === 'user') {
      currentA2UIMessageIdRef.current = null;
      streamingMessageIdRef.current = null;
    }
    setChatMessages((prev) => {
      const messageId = message.messageId || generateMessageId();
      setMessageIdCounter((c) => c + 1);
      const newMessages = [...prev, { ...message, messageId }];
      chatMessagesRef.current = newMessages;
      return newMessages;
    });
  }, [setChatMessages, setMessageIdCounter, chatMessagesRef, currentA2UIMessageIdRef, streamingMessageIdRef]);

  const updateLastChatMessage = useCallback((content: string) => {
    setChatMessages((prev) => {
      const newMessages = [...prev];
      
      // If we're streaming to a specific message, continue updating it
      if (streamingMessageIdRef.current) {
        const streamingIndex = newMessages.findIndex(m => m.messageId === streamingMessageIdRef.current);
        if (streamingIndex >= 0) {
          newMessages[streamingIndex] = { ...newMessages[streamingIndex], content };
          chatMessagesRef.current = newMessages;
          return newMessages;
        }
        // If message not found, clear the ref and continue with normal logic
        streamingMessageIdRef.current = null;
      }
      
      // First, check if there's an empty assistant message (created for A2UI) that we should update
      // But only if it was created in the current response (has tracked ref)
      const emptyAssistantIndex = newMessages.findIndex(m => 
        m.role === 'assistant' && 
        !m.content && 
        currentA2UIMessageIdRef.current === m.messageId
      );
      
      if (emptyAssistantIndex >= 0) {
        const messageId = newMessages[emptyAssistantIndex].messageId || generateMessageId();
        if (!newMessages[emptyAssistantIndex].messageId) {
          setMessageIdCounter((c) => c + 1);
        }
        newMessages[emptyAssistantIndex] = { ...newMessages[emptyAssistantIndex], content, messageId };
        // Track this messageId for streaming
        streamingMessageIdRef.current = messageId;
        // Clear the tracked ref since we've associated text with this message
        currentA2UIMessageIdRef.current = null;
        chatMessagesRef.current = newMessages;
        return newMessages;
      }

      // If no empty message with tracked ref, check if last assistant message has content
      // If it does, create a NEW message (for form submission responses)
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant' && newMessages[lastIndex].content) {
        // Last message already has content, so this is a new response - create new message
        const messageId = generateMessageId();
        setMessageIdCounter((c) => c + 1);
        newMessages.push({ role: 'assistant', content, messageId });
        streamingMessageIdRef.current = messageId;
      } else if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
        // Last message is assistant but empty - update it
        const messageId = newMessages[lastIndex].messageId || generateMessageId();
        if (!newMessages[lastIndex].messageId) {
          setMessageIdCounter((c) => c + 1);
        }
        newMessages[lastIndex] = { ...newMessages[lastIndex], content, messageId };
        streamingMessageIdRef.current = messageId;
      } else {
        // No assistant message exists - create new one
        const messageId = generateMessageId();
        setMessageIdCounter((c) => c + 1);
        newMessages.push({ role: 'assistant', content, messageId });
        streamingMessageIdRef.current = messageId;
      }

      chatMessagesRef.current = newMessages;
      return newMessages;
    });
  }, [setChatMessages, setMessageIdCounter, chatMessagesRef, currentA2UIMessageIdRef, streamingMessageIdRef]);

  return {
    addChatMessage,
    updateLastChatMessage,
  };
}
