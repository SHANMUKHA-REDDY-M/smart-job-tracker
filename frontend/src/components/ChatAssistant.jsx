import { useState } from 'react';
import customFetch from '../utils/customFetch.js';

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setMessage('');
    setError('');
    setIsSending(true);

    try {
      const { data } = await customFetch.post('/chat', {
        message: text,
        history: messages
      });
      setMessages([...nextMessages, { role: 'model', text: data.reply }]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.msg ||
          requestError.response?.data?.message ||
          'The assistant is unavailable right now.'
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="assistant-card" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div>
          <h2 id="assistant-title">Career assistant</h2>
          <p>Private job support, application insights, and career guidance.</p>
        </div>
        <span className="assistant-badge">Built in</span>
      </div>
      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat-empty">Try “How should I prepare for an interview?”</p>
        )}
        {messages.map((entry, index) => (
          <div className={`chat-message chat-${entry.role}`} key={`${entry.role}-${index}`}>
            {entry.text}
          </div>
        ))}
        {isSending && <div className="chat-message chat-model">Thinking...</div>}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Message the career assistant"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask a career question..."
          maxLength="4000"
        />
        <button type="submit" disabled={isSending || !message.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
