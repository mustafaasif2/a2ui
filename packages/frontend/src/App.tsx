import { MessageProvider } from './contexts';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <MessageProvider>
      <div className="app">
        <ChatInterface />
      </div>
    </MessageProvider>
  );
}

export default App;
