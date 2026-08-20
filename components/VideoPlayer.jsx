import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export default function VideoPlayer({ streamUrl, autoplay = true }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return undefined;

    setError('');
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        manifestLoadingTimeOut: 10000,
        maxBufferLength: 10,
        maxMaxBufferLength: 25,
        liveSyncDurationCount: 3,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setError('Unable to load this stream. Check the URL or try again.');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      if (autoplay) video.play().catch(() => {});
    } else {
      setError('HLS playback is not supported in this browser.');
    }

    return () => {
      hls?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
  }, [streamUrl, autoplay]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime || 0);
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
  }, []);

  const handleSeek = useCallback((event) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const percent = Number(event.target.value);
    video.currentTime = (percent / 100) * video.duration;
    setProgress(percent);
  }, []);

  const handleVolumeChange = useCallback((event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeSpeed = useCallback((event) => {
    const speed = Number(event.target.value);
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, []);

  const toggleFullscreen = useCallback(() => {
    videoRef.current?.parentElement?.requestFullscreen?.();
  }, []);

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        className="video-element"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onError={() => setError('The video could not be played.')}
      />
      {error && <div className="player-error" role="alert">⚠️ {error}</div>}
      <div className="player-controls">
        <div className="progress-container">
          <input aria-label="Seek video" type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek} />
          <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div className="control-buttons">
          <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '⏸' : '▶️'}</button>
          <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>{isMuted ? '🔇' : '🔊'}</button>
          <div className="speed-control"><span>{playbackSpeed.toFixed(2)}x</span><input aria-label="Playback speed" type="range" min="0.25" max="4" step="0.25" value={playbackSpeed} onChange={changeSpeed} /></div>
          <div className="volume-control"><span>{Math.round(volume * 100)}%</span><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} /></div>
          <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen">⛶</button>
        </div>
      </div>
    </div>
  );
}
