import { useAgent } from '../hooks';
import { useMessages } from '../contexts';
import { ChatHeader, MessageList, ChatInput } from './chat';
import './ChatInterface.css';

export default function ChatInterface() {
  const { chatMessages } = useMessages();
  const { sendMessage, isLoading } = useAgent();

  return (
    <div className="chat-interface">
      <ChatHeader />
      <MessageList 
        messages={chatMessages} 
        isLoading={isLoading} 
        onSelectOption={sendMessage}
      />
      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </div>
  );
}
