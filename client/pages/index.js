import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Generate a random room ID
      const newRoomId = Math.random().toString(36).substring(2, 8);
      router.push(`/room/${newRoomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Watch Together</title>
        <meta name="description" content="Watch videos together in real time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Watch Together
        </h1>
        
        <p className="text-xl text-center mb-12 max-w-2xl text-gray-300">
          Watch YouTube videos, Shorts, and MP4 videos in sync with friends
        </p>
        
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-xl">
          <div className="space-y-6">
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-300">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room code"
                  className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-md font-medium transition"
              >
                Join Room
              </button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>
            
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 rounded-md font-medium transition flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create New Room"
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>No account needed. Just create or join a room and start watching!</p>
        </div>
      </main>
    </div>
  );
} 