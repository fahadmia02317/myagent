
import React, { useState } from 'react';
import hls from 'hls.js';

export default function SettingsPanel({ streamUrl }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [enableStats, setEnableStats] = useState(false);

  // HLS-level controls
  const handleQualityChange = (level) => {
    if (hlsInstance.current && hlsInstance.current.levels) {
      hlsInstance.current.level = level;
    }
  };

  return (
    <div className="settings-panel">
      <div className="setting-group">
        <h4>Playback Speed</h4>
        <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))}>
          {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0].map(speed => (
            <option key={speed} value={speed}>
              {speed.toFixed(2)}x
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <h4>Loop</h4>
        <label className="toggle">
          <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)} />
          Loop video
        </label>
      </div>

      <div className="setting-group">
        <h4>HLS Settings</h4>
        {streamUrl && (
          <>
            <p className="hint">HLS manifest is loaded. Quality levels are managed automatically.</p>
            {/* Could add manual quality selection here */}
          </>
        )}
      </div>

      <div className="setting-group">
        <h4>About</h4>
        <p>This is a professional video player built with HLS.js, React, and Vite. It supports:</p>
        <ul>
          <li>HLS/m3u8 streaming</li>
          <li>Offline caching via Workbox</li>
          <li>Playback speed control (0.25x to 4x)</li>
          <li>Seeking and progress tracking</li>
          <li>Volume control</li>
          <li>Fullscreen mode</li>
        </ul>
      </div>
    </div>
  );
}
