import { useState, useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, isHost, onPlay, onPause, onSeek, isShort = false, fallbackUrl }) => {
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset states when video ID changes
    setPlayerReady(false);
    setLoadError(null);
    setUseFallback(false);
    
    // Use fallback if we've had multiple errors
    if (errorCount >= 3) {
      console.log('Too many API loading errors, using fallback iframe');
      setUseFallback(true);
      return;
    }

    // Load YouTube IFrame API script
    if (!window.YT) {
      console.log('Loading YouTube API');
      
      // Create a global callback that YouTube will call when API is loaded
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };
      
      // Add the script tag to document
      const tag = document.createElement('script');
      tag.src = '//www.youtube.com/iframe_api'; // Protocol-relative URL
      
      // Add error handling for the script
      tag.onerror = (e) => {
        console.error('Error loading YouTube iframe API:', e);
        setLoadError('Failed to load YouTube player. Please check your internet connection and try again.');
        setErrorCount(prev => prev + 1);
        
        // Try alternative loading method if the first one fails
        setTimeout(() => {
          if (errorCount >= 2) {
            console.log('Multiple failures, using fallback iframe');
            setUseFallback(true);
          } else {
            console.log('Attempting alternative YouTube API loading method');
            const alternativeTag = document.createElement('script');
            alternativeTag.src = 'https://www.youtube.com/iframe_api';
            alternativeTag.crossOrigin = 'anonymous';
            document.head.appendChild(alternativeTag);
          }
        }, 2000);
      };
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      console.log('YouTube API already loaded');
      initializePlayer();
    }

    return () => {
      // Clean up the player on unmount
      if (playerRef.current && !useFallback) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, errorCount]);

  useEffect(() => {
    // Handle container resize for responsive player
    function handleResize() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = isShort ? width * 16/9 : width * 9/16;
        
        if (playerRef.current?.setSize) {
          playerRef.current.setSize(width, height);
        }
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isShort]);

  const initializePlayer = () => {
    if (!videoId) {
      console.log('No video ID provided');
      return;
    }
    
    if (!window.YT?.Player) {
      console.log('YouTube Player API not ready yet');
      setTimeout(() => {
        // If YT API is still not available after a delay, increment error count
        if (!window.YT?.Player) {
          setErrorCount(prev => prev + 1);
          setLoadError('YouTube API failed to load. Trying again...');
        }
      }, 5000);
      return;
    }

    console.log('Initializing YouTube player with video ID:', videoId);

    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    try {
      // Calculate initial dimensions
      const width = containerRef.current?.clientWidth || 640;
      const height = isShort ? width * 16/9 : width * 9/16;

      // Create YouTube player
      playerRef.current = new window.YT.Player('youtube-player', {
        height: height,
        width: width,
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            console.log('YouTube player ready');
            setPlayerReady(true);
            setLoadError(null);
          },
          onStateChange: handleStateChange,
          onError: (e) => {
            console.error('YouTube player error:', e.data);
            setLoadError(`YouTube player error: ${getYouTubeErrorMessage(e.data)}`);
          }
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setLoadError('Failed to initialize YouTube player: ' + error.message);
      setErrorCount(prev => prev + 1);
    }
  };

  // Function to get descriptive error messages
  const getYouTubeErrorMessage = (errorCode) => {
    switch(errorCode) {
      case 2: return 'Invalid request (video ID not found)';
      case 5: return 'Video cannot be played in the HTML5 player';
      case 100: return 'Video not found or removed';
      case 101: 
      case 150: return 'Video owner does not allow embedding';
      default: return `Unknown error (code ${errorCode})`;
    }
  };

  const handleStateChange = (event) => {
    if (!isHost) return;

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        console.log('YouTube player state: PLAYING');
        onPlay && onPlay();
        break;
      case window.YT.PlayerState.PAUSED:
        console.log('YouTube player state: PAUSED');
        onPause && onPause();
        break;
      default:
        console.log('YouTube player state:', event.data);
        break;
    }
  };

  // If using fallback direct iframe
  if (useFallback && fallbackUrl) {
    return (
      <div 
        ref={containerRef} 
        className={`relative w-full ${isShort ? 'aspect-[9/16]' : 'aspect-video'} bg-black flex items-center justify-center`}
      >
        <iframe
          src={fallbackUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${isShort ? 'aspect-[9/16]' : 'aspect-video'} bg-black flex items-center justify-center`}
    >
      <div id="youtube-player" className="w-full h-full"></div>
      
      {!playerReady && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black bg-opacity-80">
          <div className="text-red-500 mb-2">⚠️ {loadError}</div>
          <button 
            onClick={() => {
              if (errorCount >= 3) {
                setUseFallback(true);
              } else {
                setLoadError(null);
                initializePlayer();
              }
            }}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition"
          >
            {errorCount >= 3 ? 'Use Fallback Player' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer; 