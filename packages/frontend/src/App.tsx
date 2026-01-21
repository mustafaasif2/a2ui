import { A2UIRenderer } from '@a2ui/shared/react';
import { MessageProvider, useMessages } from './contexts';
import ChatInterface from './components/ChatInterface';
import { ComponentRegistry } from './lib/registry';
import { ActionHandler } from './services';
import { DEFAULT_SURFACE_ID } from './config/constants';
import './App.css';
import './styles/A2UIRenderer.css';

function App() {
  return (
    <MessageProvider>
      <AppContent />
    </MessageProvider>
  );
}

function AppContent() {
  const { a2uiMessages } = useMessages();

  return (
    <div className="app">
      <div className="main-content">
        <header className="app-header">
          <h1>A2UI React Application</h1>
          <p>Dynamic Interface Rendering with Mastra</p>
        </header>
        <div className="app-layout">
          <main className="app-main">
            <A2UIRenderer
              messages={a2uiMessages}
              componentRegistry={ComponentRegistry}
              defaultSurfaceId={DEFAULT_SURFACE_ID}
              onAction={ActionHandler.handleAction}
            />
          </main>
          <aside className="app-chat">
            <ChatInterface />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
