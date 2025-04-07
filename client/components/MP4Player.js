import { useState, useEffect, useRef } from 'react';

const MP4Player = ({ videoUrl, isHost, onPlay, onPause, onSeek, isShort = false }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (isHost && videoRef.current && onSeek) {
      onSeek(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    if (isHost && onPlay) {
      onPlay();
    }
  };

  const handlePause = () => {
    if (isHost && onPause) {
      onPause();
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setError('Error loading video. Please check the URL and try again.');
    console.error('Video error:', e);
  };

  return (
    <div className={`relative w-full ${isShort ? 'aspect-[9/16]' : 'aspect-video'} bg-black flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="text-red-500 text-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <video
        id="video-player"
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        controls={isHost}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadedData={handleLoadedData}
        onError={handleError}
      />
    </div>
  );
};

export default MP4Player; 