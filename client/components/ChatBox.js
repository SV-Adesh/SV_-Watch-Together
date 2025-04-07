import { useState, useEffect, useRef } from 'react';

const ChatBox = ({ socket, roomId, userName, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('chat-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Clean up the event listener
    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Send message to server
    onSendMessage(message);
    
    // Add message to local state for immediate display
    setMessages((prevMessages) => [
      ...prevMessages, 
      { message, userName, timestamp: new Date().toISOString() }
    ]);
    
    // Clear input
    setMessage('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-gray-700 p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold">Room Chat</h3>
      </div>
      
      {/* Messages area */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.userName === userName ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs sm:max-w-sm rounded-lg px-4 py-2 ${
                    msg.userName === userName 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-700 text-white rounded-bl-none'
                  }`}
                >
                  {msg.userName !== userName && (
                    <div className="text-xs text-purple-300 font-semibold mb-1">{msg.userName}</div>
                  )}
                  <div>{msg.message}</div>
                  <div className="text-xs text-gray-300 mt-1 text-right">
                    {msg.timestamp && formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="bg-gray-700 p-3">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-4 py-2 bg-gray-600 border border-gray-600 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox; 