import { useState, useEffect } from 'react';

const EmojiReactions = ({ socket, onEmojiSelect }) => {
  const [showingEmojis, setShowingEmojis] = useState([]);
  
  // Available emoji reactions
  const emojis = ['❤️', '😂', '👍', '👏', '🔥', '😮', '🎉', '💯'];

  useEffect(() => {
    if (!socket) return;

    // Listen for emoji reactions from other users
    socket.on('emoji-reaction', (data) => {
      addFloatingEmoji(data.emoji);
    });

    return () => {
      socket.off('emoji-reaction');
    };
  }, [socket]);

  // Function to handle emoji selection
  const handleEmojiClick = (emoji) => {
    // Send to server
    onEmojiSelect(emoji);
    
    // Show locally immediately
    addFloatingEmoji(emoji);
  };

  // Function to add a floating emoji that animates and disappears
  const addFloatingEmoji = (emoji) => {
    // Generate a unique ID for this emoji instance
    const id = Date.now();
    
    // Randomize the starting position (horizontally centered, but varies)
    const startPosition = Math.random() * 60 + 20; // between 20% and 80% of the width
    
    // Add the emoji to the state
    setShowingEmojis(prev => [
      ...prev, 
      { id, emoji, position: startPosition }
    ]);
    
    // Remove the emoji after animation completes
    setTimeout(() => {
      setShowingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  return (
    <div className="relative">
      {/* Floating emojis container */}
      <div className="absolute bottom-full left-0 right-0 h-64 pointer-events-none overflow-hidden">
        {showingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-0 text-3xl animate-float"
            style={{
              left: `${item.position}%`,
              animationDuration: `${2 + Math.random()}s`
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
      
      {/* Emoji selector bar */}
      <div className="bg-gray-800 p-3 flex justify-center flex-wrap gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="text-2xl bg-gray-700 hover:bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-110"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiReactions; 