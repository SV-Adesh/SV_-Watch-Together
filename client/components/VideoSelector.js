import { useState } from 'react';

const VideoSelector = ({ onVideoChange, onReelChange, videoMode, setVideoMode }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState('youtube');
  const [reelUrls, setReelUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample presets for demo purposes
  const popularVideos = [
    { name: 'Big Buck Bunny (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'mp4' },
    { name: 'TED Talk: The Power of Vulnerability', url: 'https://www.youtube.com/watch?v=iCvmsMzlF7o', type: 'youtube' },
    { name: 'YouTube Music Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'youtube' },
    { name: 'NASA International Space Station', url: 'https://www.youtube.com/watch?v=86YLFOog4GM', type: 'youtube' },
  ];

  // Function to validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return false;
    
    // Simple regex to check if URL could be a YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!videoUrl.trim()) {
      setErrorMessage('Please enter a video URL');
      return;
    }
    
    // Validate YouTube URLs
    if (videoType === 'youtube' && !validateYouTubeUrl(videoUrl)) {
      setErrorMessage('Please enter a valid YouTube URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      onVideoChange(videoUrl, videoType, 'normal');
      
      // Reset the form after a brief delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error changing video:', error);
      setErrorMessage('Error loading video. Please try again.');
      setIsLoading(false);
    }
  };

  const handleReelSubmit = (e) => {
    e.preventDefault();
    
    if (!reelUrls.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Split by new lines and filter out empty lines
      const videos = reelUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      onReelChange(videos);
      setVideoMode('reel');
      
      // Reset the form after a brief delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up reels:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap mb-4">
          <button
            onClick={() => setVideoMode('normal')}
            className={`mr-2 mb-2 px-4 py-2 rounded ${videoMode === 'normal' ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700 transition`}
          >
            Normal Mode
          </button>
          <button
            onClick={() => setVideoMode('reel')}
            className={`mr-2 mb-2 px-4 py-2 rounded ${videoMode === 'reel' ? 'bg-pink-600' : 'bg-gray-700'} hover:bg-pink-700 transition`}
          >
            Reel Mode
          </button>
        </div>

        {videoMode === 'normal' ? (
          <div>
            <h3 className="text-lg font-semibold mb-3">Play a Video</h3>
            <form onSubmit={handleVideoSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white w-full sm:w-32"
              >
                <option value="youtube">YouTube</option>
                <option value="mp4">MP4 URL</option>
              </select>
              
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={videoType === 'youtube' ? 'Enter YouTube URL' : 'Enter MP4 URL'}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white flex-grow"
                required
              />
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium transition flex items-center justify-center min-w-[80px]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Play"
                )}
              </button>
            </form>
            
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-900 bg-opacity-50 text-red-200 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <h4 className="text-sm text-gray-400 mb-2">Popular Videos</h4>
              <div className="flex flex-wrap gap-2">
                {popularVideos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setVideoUrl(video.url);
                      setVideoType(video.type);
                      onVideoChange(video.url, video.type, 'normal');
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
                  >
                    {video.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Reel Playlist</h3>
            <form onSubmit={handleReelSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Enter one URL per line (YouTube or MP4)
                </label>
                <textarea
                  value={reelUrls}
                  onChange={(e) => setReelUrls(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/xxxxx&#10;https://example.com/video.mp4&#10;https://youtu.be/xxxxx"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white h-24 font-mono text-sm"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-md font-medium transition flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  "Start Reels"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSelector; 