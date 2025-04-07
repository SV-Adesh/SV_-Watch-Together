import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import YouTubePlayer from './YouTubePlayer';
import MP4Player from './MP4Player';

const VideoPlayer = forwardRef(({
  videoUrl,
  videoType,
  videoMode,
  isHost,
  reelVideos,
  reelIndex,
  onReelNext,
  onReelPrev,
  onPlay,
  onPause,
  onSeek
}, ref) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Set loading to false after a short delay to prevent flickering
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [videoUrl]);

  // Get the current reel video if in reel mode
  const currentReelVideo = videoMode === 'reel' && reelVideos && reelVideos.length > 0 
    ? reelVideos[reelIndex] 
    : null;

  // Forward play, pause, and seek methods to ref
  useImperativeHandle(ref, () => ({
    play: () => {
      const player = document.getElementById('video-player');
      if (player) {
        player.play();
      }
    },
    pause: () => {
      const player = document.getElementById('video-player');
      if (player) {
        player.pause();
      }
    },
    seekTo: (time) => {
      const player = document.getElementById('video-player');
      if (player) {
        player.currentTime = time;
      }
    }
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // No video selected yet
  if (!videoUrl && !currentReelVideo) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
        <div className="text-2xl mb-4 text-gray-400">No Video Selected</div>
        {isHost ? (
          <p className="text-gray-500 max-w-md">
            As the host, you can paste a YouTube URL or select an MP4 video above to get started.
          </p>
        ) : (
          <p className="text-gray-500 max-w-md">
            Waiting for the host to select a video...
          </p>
        )}
      </div>
    );
  }

  // Determine which player to use based on video type
  if (videoMode === 'reel') {
    // Reel mode (TikTok/Instagram style)
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {videoType === 'youtube' ? (
          <YouTubePlayer
            videoId={extractYouTubeId(currentReelVideo)}
            isHost={isHost}
            onPlay={onPlay}
            onPause={onPause}
            onSeek={onSeek}
            isShort={true}
          />
        ) : (
          <MP4Player
            videoUrl={currentReelVideo}
            isHost={isHost}
            onPlay={onPlay}
            onPause={onPause}
            onSeek={onSeek}
            isShort={true}
          />
        )}
        
        {/* Reel navigation buttons */}
        <div className="absolute right-4 bottom-1/2 flex flex-col space-y-4">
          <button 
            onClick={onReelPrev}
            className="p-2 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div className="text-center text-white bg-gray-800 bg-opacity-50 px-2 py-1 rounded">
            {reelIndex + 1}/{reelVideos.length}
          </div>
          <button 
            onClick={onReelNext}
            className="p-2 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    );
  } else {
    // Normal mode
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        {videoType === 'youtube' ? (
          <YouTubePlayer
            videoId={extractYouTubeId(videoUrl)}
            isHost={isHost}
            onPlay={onPlay}
            onPause={onPause}
            onSeek={onSeek}
            isShort={isYouTubeShort(videoUrl)}
          />
        ) : (
          <MP4Player
            videoUrl={videoUrl}
            isHost={isHost}
            onPlay={onPlay}
            onPause={onPause}
            onSeek={onSeek}
          />
        )}
      </div>
    );
  }
});

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handle direct video ID input
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
    return url;
  }
  
  // Extract video ID from query parameters (handles playlists, etc.)
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // First check for 'v' parameter which contains the video ID
    if (searchParams.has('v')) {
      return searchParams.get('v');
    }
    
    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }
    
    // Handle youtube.com/shorts format
    if (urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/shorts/')[1].split('/')[0];
    }
    
    // Handle youtube.com/embed format
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1].split('/')[0];
    }
    
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    
    // Fallback to regex-based extraction
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  
  // If all else fails, return the original URL (won't work but prevents errors)
  console.warn('Could not extract YouTube video ID from:', url);
  return url;
}

// Helper function to determine if the URL is a YouTube Short
function isYouTubeShort(url) {
  if (!url) return false;
  return url.includes('youtube.com/shorts/');
}

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 