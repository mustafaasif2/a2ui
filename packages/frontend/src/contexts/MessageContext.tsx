import { createContext, useContext, ReactNode } from 'react';
import type { A2UIMessage } from '@a2ui/shared';
import type { ChatMessage } from '../types/message';
import { useMessageState, useA2UIMessageState, useMessageIdRefs } from '../hooks/useMessageState';
import { useChatMessages } from '../hooks/useChatMessages';
import { useA2UIMessages } from '../hooks/useA2UIMessages';

interface MessageContextValue {
  chatMessages: ChatMessage[];
  a2uiMessagesByMessageId: Map<string, A2UIMessage[]>;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  addA2UIMessage: (message: A2UIMessage, messageId?: string) => void;
  getA2UIMessagesForMessage: (messageId: string) => A2UIMessage[];
  clearA2UIMessageIdRef: () => void;
}

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  // State management
  const messageState = useMessageState();
  const a2uiState = useA2UIMessageState();
  const messageIdRefs = useMessageIdRefs();

  // Chat message operations
  const { addChatMessage, updateLastChatMessage } = useChatMessages({
    chatMessages: messageState.chatMessages,
    setChatMessages: messageState.setChatMessages,
    messageIdCounter: messageState.messageIdCounter,
    setMessageIdCounter: messageState.setMessageIdCounter,
    chatMessagesRef: messageState.chatMessagesRef,
    currentA2UIMessageIdRef: messageIdRefs.currentA2UIMessageIdRef,
    streamingMessageIdRef: messageIdRefs.streamingMessageIdRef,
  });

  // A2UI message operations
  const { addA2UIMessage, getA2UIMessagesForMessage, clearA2UIMessageIdRef } = useA2UIMessages({
    a2uiMessagesByMessageId: a2uiState.a2uiMessagesByMessageId,
    setA2uiMessagesByMessageId: a2uiState.setA2uiMessagesByMessageId,
    chatMessages: messageState.chatMessages,
    chatMessagesRef: messageState.chatMessagesRef,
    setChatMessages: messageState.setChatMessages,
    messageIdCounter: messageState.messageIdCounter,
    setMessageIdCounter: messageState.setMessageIdCounter,
    currentA2UIMessageIdRef: messageIdRefs.currentA2UIMessageIdRef,
    streamingMessageIdRef: messageIdRefs.streamingMessageIdRef,
  });

  return (
    <MessageContext.Provider
      value={{
        chatMessages: messageState.chatMessages,
        a2uiMessagesByMessageId: a2uiState.a2uiMessagesByMessageId,
        addChatMessage,
        updateLastChatMessage,
        addA2UIMessage,
        getA2UIMessagesForMessage,
        clearA2UIMessageIdRef,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within MessageProvider');
  }
  return context;
}
