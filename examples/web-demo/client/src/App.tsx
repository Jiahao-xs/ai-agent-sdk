import { ChatContainer } from './components/ChatContainer';
import { useChat } from './hooks/useChat';
import './styles/app.css';

function App() {
  const { messages, loading, sendMessage } = useChat();

  return <ChatContainer messages={messages} loading={loading} onSend={sendMessage} />;
}

export default App;
