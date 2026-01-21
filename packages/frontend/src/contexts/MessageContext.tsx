import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { A2UIMessage } from '@a2ui/shared';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageContextValue {
  chatMessages: ChatMessage[];
  a2uiMessages: A2UIMessage[];
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  addA2UIMessage: (message: A2UIMessage) => void;
}

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [a2uiMessages, setA2uiMessages] = useState<A2UIMessage[]>([]);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  }, []);

  const updateLastChatMessage = useCallback((content: string) => {
    setChatMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;

      if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
        newMessages[lastIndex] = { role: 'assistant', content };
      } else {
        newMessages.push({ role: 'assistant', content });
      }

      return newMessages;
    });
  }, []);

  const addA2UIMessage = useCallback((message: A2UIMessage) => {
    setA2uiMessages((prev) => [...prev, message]);
  }, []);

  return (
    <MessageContext.Provider
      value={{
        chatMessages,
        a2uiMessages,
        addChatMessage,
        updateLastChatMessage,
        addA2UIMessage,
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
