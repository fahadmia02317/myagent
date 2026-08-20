
import { useEffect, useRef, useState, useCallback } from 'react';
import hls from 'hls.js';

export default function VideoPlayer({ streamUrl, autoplay = true }) {
  const videoRef = useRef(null);
  const hlsInstance = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // HLS initialization
  useEffect(() => {
    if (hlsInstance.current && hlsInstance.current.destroy) {
      hlsInstance.current.destroy();
    }

    if (videoRef.current && streamUrl) {
      let hls;

      if (hls.isSupported()) {
        hls = new hls.DefaultHLS({
          manifestLoadingTimeout: 10000,
          maxBufferLength: 10,
          maxMaxBufferLength: 25,
          liveSyncDurationCount: 3,
          liveSyncDurationOffset: -2,
          enableEAC: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(hls.Events.MANIFEST_PARSED, () => {
          if (autoplay) {
            videoRef.current.play().catch(() => {});
          }
        });

        hls.on(hls.Events.FEEDBACK, ({ type, detail }) => {
          if (type === 'BUFFERING_PROGRESS') {
            const buffered = Math.round((detail.bufferedEnd - detail.bufferedStart) / 1000 * 100);
            setProgress(buffered);
          }
        });

        hls.on(hls.Events.LEVEL_SWITCHED, ({ data: level }) => {
          console.log(`Switching to level ${level}`);
        });

        if (autoplay) {
          videoRef.current.play().catch(() => {});
        }

      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        const media = videoRef.current;
        
        media.addEventListener('loadedmetadata', () => {
          console.log('Native HLS loaded');
        });

        media.play().catch(() => {});
      } else if (videoRef.current.canPlayType('application/x-mpegURL')) {
        // Firefox native HLS support
        const media = videoRef.current;
        
        media.addEventListener('loadedmetadata', () => {
          console.log('Firefox native HLS loaded');
        });

        media.play().catch(() => {});
      } else {
        throw new Error('HLS not supported');
      }

      return () => {
        if (hlsInstance.current && hlsInstance.current.destroy) {
          hlsInstance.current.destroy();
        }
      };
    }
  }, [streamUrl, autoplay]);

  // Playback speed control
  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  // Seek functionality
  const handleSeek = useCallback((e) => {
    const timeValue = e.target.value || 0;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = Math.min(
        Math.max(timeValue, 0),
        duration
      );
    }
  }, [duration]);

  // Progress update
  const handleProgressUpdate = useCallback((e) => {
    if (videoRef.current && duration > 0) {
      const newProgress = Math.round(
        (videoRef.current.currentTime / duration) * 100
      );
      setProgress(newProgress);
    }
  }, [duration]);

  // Duration update
  const handleDurationUpdate = useCallback(() => {
    if (videoRef.current && videoRef.current.duration > 0) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  return (
    <div className="video-player-container">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-element"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => console.log('Buffering...')}
        onCanPlay={() => console.log('Ready to play')}
        onError={(e) => console.error('Video error:', e)}
      />

      {/* Player Controls */}
      <div className="player-controls">
        {/* Progress Bar */}
        <div className="progress-container">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={handleSeek}
            onMouseEnter={handleProgressUpdate}
            onTouchStart={handleProgressUpdate}
          />
          <span className="time-display">
            {Math.round((videoRef.current?.currentTime || 0) / 60)}:{String(Math.round(videoRef.current?.currentTime % 60)).padStart(2, '0')} / 
            {duration > 0 ? Math.round(duration / 60)}:{String(Math.round(duration % 60)).padStart(2, '0')}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          <button onClick={() => videoRef.current?.pause()}>⏸</button>
          {isPlaying && (
            <button onClick={() => videoRef.current?.play()}>▶️</button>
          )}
          
          {/* Playback Speed */}
          <div className="speed-control">
            <span>{playbackSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min={0.25}
              max={4.0}
              step={0.25}
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            />
          </div>

          {/* Volume */}
          <div className="volume-control">
            <span>{Math.round(volume * 100)}%</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>

          {/* Fullscreen */}
          <button onClick={() => {
            if (videoRef.current) {
              videoRef.current.requestFullscreen?.();
            }
          }}>⛶</button>
        </div>
      </div>
    </div>
  );
}
