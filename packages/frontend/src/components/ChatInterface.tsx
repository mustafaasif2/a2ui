import { useAgent, useActionHandler, useErrorHandler } from '../hooks';
import { useMessages } from '../contexts';
import { ChatHeader, MessageList, ChatInput } from './chat';
import { ComponentRegistry } from '../lib/registry';
import { DEFAULT_SURFACE_ID } from '../config/constants';
import './ChatInterface.css';
import '../styles/A2UIRenderer.css';

export default function ChatInterface() {
  const { chatMessages, getA2UIMessagesForMessage } = useMessages();
  const { sendMessage, isLoading } = useAgent();
  const { handleAction, actionLoadingStates } = useActionHandler();
  const { handleError } = useErrorHandler();

  return (
    <div className="chat-interface">
      <ChatHeader />
      <MessageList 
        messages={chatMessages}
        getA2UIMessagesForMessage={getA2UIMessagesForMessage}
        isLoading={isLoading} 
        onSelectOption={sendMessage}
        componentRegistry={ComponentRegistry}
        defaultSurfaceId={DEFAULT_SURFACE_ID}
        onAction={handleAction}
        actionLoadingStates={actionLoadingStates}
        onError={handleError}
      />
      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </div>
  );
}
