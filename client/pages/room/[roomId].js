import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import io from 'socket.io-client';
import VideoPlayer from '../../components/VideoPlayer';
import ChatBox from '../../components/ChatBox';
import VideoSelector from '../../components/VideoSelector';
import EmojiReactions from '../../components/EmojiReactions';
import UserCount from '../../components/UserCount';

// The socket will be initialized in useEffect
let socket;

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoType, setVideoType] = useState('youtube'); // 'youtube' or 'mp4'
  const [videoMode, setVideoMode] = useState('normal'); // 'normal' or 'reel'
  const [reelIndex, setReelIndex] = useState(0);
  const [reelVideos, setReelVideos] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  
  const videoRef = useRef(null);

  useEffect(() => {
    // Generate a random username if not set
    if (!userName && !showNameInput) {
      setUserName(`User-${Math.floor(Math.random() * 10000)}`);
    }
  }, [userName, showNameInput]);

  useEffect(() => {
    // Only initialize socket once roomId is available
    if (!roomId) return;

    // Backend URL (will be set to env variable in production)
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Connect to Socket.io server
    socket = io(BACKEND_URL, {
      query: { roomId }
    });

    // Socket connection event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Notify server about joining room
      socket.emit('join-room', { roomId, userName: userName || `User-${Math.floor(Math.random() * 10000)}` });
    });

    socket.on('host-assigned', (isRoomHost) => {
      setIsHost(isRoomHost);
    });

    socket.on('user-count', (count) => {
      setUserCount(count);
    });

    socket.on('video-change', (videoData) => {
      setCurrentVideo(videoData.videoUrl);
      setVideoType(videoData.videoType);
      setVideoMode(videoData.videoMode);
    });

    socket.on('reel-videos', (videos) => {
      setReelVideos(videos);
    });

    socket.on('reel-index', (index) => {
      setReelIndex(index);
    });

    socket.on('video-play', () => {
      if (videoRef.current && !isHost) {
        videoRef.current.play();
      }
    });

    socket.on('video-pause', () => {
      if (videoRef.current && !isHost) {
        videoRef.current.pause();
      }
    });

    socket.on('video-seek', (time) => {
      if (videoRef.current && !isHost) {
        videoRef.current.seekTo(time);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId, userName]);

  const handleVideoChange = (videoUrl, type = 'youtube', mode = 'normal') => {
    if (isHost && socket) {
      socket.emit('video-change', {
        roomId,
        videoUrl,
        videoType: type,
        videoMode: mode
      });
      setCurrentVideo(videoUrl);
      setVideoType(type);
      setVideoMode(mode);
    }
  };

  const handleReelChange = (videos) => {
    if (isHost && socket) {
      socket.emit('reel-videos', { roomId, videos });
      setReelVideos(videos);
      // Start with the first video
      handleReelIndexChange(0);
    }
  };

  const handleReelIndexChange = (index) => {
    if (isHost && socket) {
      socket.emit('reel-index', { roomId, index });
      setReelIndex(index);
    }
  };

  const handleVideoPlay = () => {
    if (isHost && socket) {
      socket.emit('video-play', { roomId });
    }
  };

  const handleVideoPause = () => {
    if (isHost && socket) {
      socket.emit('video-pause', { roomId });
    }
  };

  const handleVideoSeek = (time) => {
    if (isHost && socket) {
      socket.emit('video-seek', { roomId, time });
    }
  };

  const handleEmojiReaction = (emoji) => {
    if (socket) {
      socket.emit('emoji-reaction', { roomId, emoji, userName });
    }
  };

  const handleChatMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', { roomId, message, userName });
    }
  };

  const handleSetUserName = (name) => {
    if (name.trim()) {
      setUserName(name);
      setShowNameInput(false);
      
      // Update username on the server if connected
      if (socket && isConnected) {
        socket.emit('update-username', { roomId, userName: name });
      }
    }
  };

  if (!roomId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Enter Your Name</h1>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSetUserName(userName);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-md font-medium transition"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Room {roomId} - Watch Together</title>
        <meta name="description" content="Watch videos together in real time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between container mx-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Watch Together
              </h1>
              <div className="px-3 py-1 rounded-full bg-gray-700 text-sm">
                Room: <span className="font-mono">{roomId}</span>
              </div>
              {isHost && (
                <div className="px-3 py-1 rounded-full bg-purple-600 text-xs">
                  Host
                </div>
              )}
            </div>
            <UserCount count={userCount} />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col lg:flex-row">
          {/* Video section */}
          <div className={`flex-grow flex flex-col ${showChat ? 'lg:w-3/4' : 'lg:w-full'}`}>
            {/* Video controls for host */}
            {isHost && (
              <VideoSelector 
                onVideoChange={handleVideoChange} 
                onReelChange={handleReelChange}
                videoMode={videoMode}
                setVideoMode={setVideoMode}
              />
            )}
            
            {/* Video player */}
            <div className="flex-grow flex items-center justify-center bg-black p-2">
              <VideoPlayer
                ref={videoRef}
                videoUrl={currentVideo}
                videoType={videoType}
                videoMode={videoMode}
                isHost={isHost}
                reelVideos={reelVideos}
                reelIndex={reelIndex}
                onReelNext={() => {
                  const nextIndex = (reelIndex + 1) % reelVideos.length;
                  handleReelIndexChange(nextIndex);
                }}
                onReelPrev={() => {
                  const prevIndex = (reelIndex - 1 + reelVideos.length) % reelVideos.length;
                  handleReelIndexChange(prevIndex);
                }}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onSeek={handleVideoSeek}
              />
            </div>
            
            {/* Emoji reactions */}
            <EmojiReactions socket={socket} onEmojiSelect={handleEmojiReaction} />
          </div>

          {/* Chat section - toggleable on mobile */}
          <div 
            className={`bg-gray-800 ${showChat ? 'block' : 'hidden'} ${showChat ? 'lg:w-1/4' : 'lg:w-0'} lg:min-w-[300px] transition-all duration-300 ease-in-out`}
          >
            <ChatBox socket={socket} roomId={roomId} userName={userName} onSendMessage={handleChatMessage} />
          </div>
        </main>

        {/* Footer with toggle chat button */}
        <footer className="bg-gray-800 p-2 lg:hidden">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium transition"
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        </footer>
      </div>
    </div>
  );
} 