import React, { useState } from 'react';

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState('');
  const sessionId = 'unique-session-id'; // You can generate this dynamically

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = input;
    setInput('');

    // Add user message to chat
    setMessages((prev) => [...prev, { user: userMessage, bot: '' }]);

    try {
      // Send message to Gemini API via our backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add bot response to chat
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].bot = data.response;
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      // Optionally display an error message in the UI
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <p><strong>User:</strong> {msg.user}</p>
            {msg.bot && <p><strong>Gemini:</strong> {msg.bot}</p>}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;