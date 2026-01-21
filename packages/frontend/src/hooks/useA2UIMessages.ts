import { useCallback } from 'react';
import type React from 'react';
import type { A2UIMessage } from '@a2ui/shared';
import type { ChatMessage } from '../types/message';
import { generateMessageId } from '../utils/messageId';
import { routeA2UIMessageToMessageId } from '../utils/messageRouting';

// Note: This hook needs access to setChatMessages which is passed via params

interface UseA2UIMessagesParams {
  a2uiMessagesByMessageId: Map<string, A2UIMessage[]>;
  setA2uiMessagesByMessageId: React.Dispatch<React.SetStateAction<Map<string, A2UIMessage[]>>>;
  chatMessages: ChatMessage[];
  chatMessagesRef: React.MutableRefObject<ChatMessage[]>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  messageIdCounter: number;
  setMessageIdCounter: React.Dispatch<React.SetStateAction<number>>;
  currentA2UIMessageIdRef: React.MutableRefObject<string | null>;
  streamingMessageIdRef: React.MutableRefObject<string | null>;
}

/**
 * Custom hook for A2UI message operations
 */
export function useA2UIMessages({
  a2uiMessagesByMessageId,
  setA2uiMessagesByMessageId,
  chatMessages,
  chatMessagesRef,
  setChatMessages,
  messageIdCounter,
  setMessageIdCounter,
  currentA2UIMessageIdRef,
  streamingMessageIdRef,
}: UseA2UIMessagesParams) {
  const addA2UIMessage = useCallback((message: A2UIMessage, messageId?: string) => {
    setA2uiMessagesByMessageId((prev) => {
      const newMap = new Map(prev);
      let targetMessageId = messageId;
      
      // Special handling for deleteSurface: route it to the message that contains the surface being deleted
      if (message.type === 'deleteSurface' && message.surfaceId) {
        const routedId = routeA2UIMessageToMessageId(message, newMap, chatMessagesRef.current);
        if (routedId) {
          targetMessageId = routedId;
        }
        
        // After routing deleteSurface, clear the ref so subsequent A2UI messages create a NEW message
        // This ensures the success component appears in a new message, not the same one as the form
        currentA2UIMessageIdRef.current = null;
      }
      
      // If no messageId provided (and not a deleteSurface we routed), find or create the last assistant message
      if (!targetMessageId) {
        // First check if we have a tracked messageId from a previous A2UI message in this response
        if (currentA2UIMessageIdRef.current) {
          console.log('Using tracked messageId from ref:', currentA2UIMessageIdRef.current);
          targetMessageId = currentA2UIMessageIdRef.current;
        } else {
          console.log('No tracked messageId, searching for existing assistant message');
          // Check if the LAST assistant message exists and is empty (created for A2UI)
          // Only use it if it's the most recent message to avoid associating with old messages
          const allMessages = chatMessagesRef.current;
          const lastMessage = allMessages[allMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
            // Last message is an empty assistant message - use it
            targetMessageId = lastMessage.messageId;
            console.log('Using last empty assistant message:', targetMessageId);
          } else {
            // Last message is not an empty assistant, or doesn't exist - will create new one
            targetMessageId = undefined;
          }
          
          // If no assistant message exists, create one
          if (!targetMessageId) {
            const newMessageId = generateMessageId();
            // Set ref IMMEDIATELY and synchronously before any async state updates
            // This ensures subsequent A2UI messages in the same response use the same messageId
            currentA2UIMessageIdRef.current = newMessageId;
            // Also set streaming ref so text updates go to the same message
            streamingMessageIdRef.current = newMessageId;
            setMessageIdCounter((c) => c + 1);
            setChatMessages((prevMessages) => {
              // Double-check we didn't just add one (race condition protection)
              const existing = prevMessages.find(m => m.role === 'assistant' && !m.content);
              if (existing?.messageId) {
                // Use the existing one and update refs
                currentA2UIMessageIdRef.current = existing.messageId;
                streamingMessageIdRef.current = existing.messageId;
                return prevMessages;
              }
              const newMessages = [...prevMessages, { 
                role: 'assistant' as const, 
                content: '', 
                messageId: newMessageId 
              }];
              chatMessagesRef.current = newMessages;
              return newMessages;
            });
            targetMessageId = newMessageId;
          } else {
            // Track this messageId for subsequent A2UI messages and text streaming
            currentA2UIMessageIdRef.current = targetMessageId;
            streamingMessageIdRef.current = targetMessageId;
          }
        }
      } else {
        // If messageId is provided, update the tracked refs
        currentA2UIMessageIdRef.current = targetMessageId;
        streamingMessageIdRef.current = targetMessageId;
      }
      
      console.log('Associating A2UI message with messageId:', targetMessageId, message);
      const existing = newMap.get(targetMessageId) || [];
      // Avoid duplicates - check if this exact message already exists
      const isDuplicate = existing.some(
        (m) => m.type === message.type && 
        JSON.stringify(m) === JSON.stringify(message)
      );
      if (!isDuplicate) {
        newMap.set(targetMessageId, [...existing, message]);
      }
      return newMap;
    });
  }, [
    setA2uiMessagesByMessageId,
    chatMessagesRef,
    setChatMessages,
    messageIdCounter,
    setMessageIdCounter,
    currentA2UIMessageIdRef,
    streamingMessageIdRef,
  ]);

  const getA2UIMessagesForMessage = useCallback((messageId: string) => {
    return a2uiMessagesByMessageId.get(messageId) || [];
  }, [a2uiMessagesByMessageId]);

  const clearA2UIMessageIdRef = useCallback(() => {
    // Only clear the A2UI ref, not the streaming ref
    // The streaming ref should persist so text can update the message created for A2UI responses
    currentA2UIMessageIdRef.current = null;
    // Don't clear streamingMessageIdRef here - it will be set when A2UI creates a message
    // and should persist for text streaming
  }, [currentA2UIMessageIdRef]);

  return {
    addA2UIMessage,
    getA2UIMessagesForMessage,
    clearA2UIMessageIdRef,
  };
}
