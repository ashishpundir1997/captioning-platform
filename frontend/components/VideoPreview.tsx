import { useEffect, useRef, useState } from 'react';
import { Caption, CaptionStyle, API_BASE_URL } from '@/lib/constants';
import { renderVideo } from '@/lib/api';

interface VideoPreviewProps {
  filename: string;
  videoId?: string;  // Video ID from Supabase
  videoUrl?: string;  // Optional: direct URL to video (from Supabase)
  captions: Caption[];
  style: CaptionStyle;
}

export default function VideoPreview({ filename, videoId, videoUrl, captions, style }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  // Use provided videoUrl (Supabase) or fallback to local uploads path
  const videoSrc = videoUrl || `${API_BASE_URL}/uploads/${filename}`;

  // Debug: Log the video source URL
  useEffect(() => {
    console.log('📹 Video source URL:', videoSrc);
    console.log('📹 Provided videoUrl:', videoUrl);
    console.log('📹 Filename:', filename);
  }, [videoSrc, videoUrl, filename]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setIsRendering(true);

      // Render the video with captions
      console.log('🎬 Starting video render...');
      const result = await renderVideo(videoId || filename, captions, style);
      
      console.log('✅ Video rendered:', result.filename);
      setRenderedVideoUrl(result.downloadUrl);
      
      // Download the rendered video
      const response = await fetch(result.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Download complete!');
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to render and download video. Please try again.');
    } finally {
      setIsDownloading(false);
      setIsRendering(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Get current caption
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  const getCaptionStyleClass = () => {
    switch (style) {
      case 'top':
        return 'caption-top';
      case 'karaoke':
        return 'caption-karaoke';
      default:
        return 'caption-bottom';
    }
  };

  return (
    <div className="card">
      <h2 style={{ color: 'var(--text-color)' }}>Video Preview</h2>
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          className="video-player"
        />
        {currentCaption && (
          <div className={`caption-overlay ${getCaptionStyleClass()}`}>
            {currentCaption.text}
          </div>
        )}
      </div>
      
      <div className="preview-info">
        <p>
          <strong>Time:</strong> {currentTime.toFixed(2)}s
        </p>
        {currentCaption && (
          <p>
            <strong>Caption:</strong> {currentCaption.text}
          </p>
        )}
        
        <button
          onClick={handleDownload}
          disabled={isDownloading || isRendering}
          className="download-btn"
        >
          {isRendering ? '🎬 Rendering video with captions...' : isDownloading ? '⬇️ Downloading...' : '⬇️ Download Video with Captions'}
        </button>
      </div>
    </div>
  );
}
