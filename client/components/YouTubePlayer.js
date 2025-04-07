import { useState, useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, isHost, onPlay, onPause, onSeek, isShort = false }) => {
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API script
    if (!window.YT) {
      const tag = document.createElement('script');
      // Use protocol-relative URL to match the current page protocol
      tag.src = '//www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      // Clean up the player on unmount
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

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
    if (!videoId || !window.YT?.Player) return;

    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.destroy();
    }

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
        onReady: () => setPlayerReady(true),
        onStateChange: handleStateChange,
      },
    });
  };

  const handleStateChange = (event) => {
    if (!isHost) return;

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        onPlay && onPlay();
        break;
      case window.YT.PlayerState.PAUSED:
        onPause && onPause();
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${isShort ? 'aspect-[9/16]' : 'aspect-video'} bg-black flex items-center justify-center`}
    >
      <div id="youtube-player" className="w-full h-full"></div>
      
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer; 