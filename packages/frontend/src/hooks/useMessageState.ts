import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/message';
import type { A2UIMessage } from '@a2ui/shared';
import { generateMessageId } from '../utils/messageId';

/**
 * Custom hook for managing chat message state
 */
export function useMessageState() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  return {
    chatMessages,
    setChatMessages,
    messageIdCounter,
    setMessageIdCounter,
    chatMessagesRef,
  };
}

/**
 * Custom hook for managing A2UI message state
 */
export function useA2UIMessageState() {
  const [a2uiMessagesByMessageId, setA2uiMessagesByMessageId] = useState<Map<string, A2UIMessage[]>>(new Map());

  return {
    a2uiMessagesByMessageId,
    setA2uiMessagesByMessageId,
  };
}

/**
 * Custom hook for managing message ID refs
 */
export function useMessageIdRefs() {
  // Track the current assistant messageId for A2UI messages
  const currentA2UIMessageIdRef = useRef<string | null>(null);
  // Track the messageId being updated during text streaming
  const streamingMessageIdRef = useRef<string | null>(null);

  return {
    currentA2UIMessageIdRef,
    streamingMessageIdRef,
  };
}
