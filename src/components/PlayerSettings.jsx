
import React, { useState } from 'react';

export default function PlayerSettings({ children }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="player-wrapper" style={{ position: 'relative' }}>
      {children}
      
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="settings-btn"
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <div className="settings-panel">
          {/* Settings content */}
        </div>
      )}
    </div>
  );
}
