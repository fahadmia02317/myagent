
import { useEffect, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';

const YOUR_M3U8_URL = "https://videoplayer-fawn-gamma.vercel.app/api/m3u?libId=732428&apiKey=29f1deac-1ed8-4203-8a3ec42dddf8-1a0c-486e&cdnHost=vz-234126c0-eb.b-cdn.net";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading for demo purposes
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);
  }, []);

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="top-bar">
        <h1>🎬 Pro Video Player</h1>
        {isLoaded && (
          <p className="status-text">✓ Ready to play • HLS/m3u8 Support Enabled</p>
        )}
      </header>

      {/* Main Content */}
      <main className="main-content">
        {isLoaded ? (
          <>
            <VideoPlayer 
              streamUrl={YOUR_M3U8_URL} 
              autoplay={true}
            />
            
            {/* Player Info Card */}
            <div className="player-info-card">
              <h2>📋 Stream Information</h2>
              <p><strong>Stream URL:</strong> {YOUR_M3U8_URL}</p>
              
              <h3>⚙️ Available Features</h3>
              <ul>
                <li>✅ HLS/m3u8 streaming support</li>
                <li>✅ Playback speed control (0.25x - 4x)</li>
                <li>✅ Offline caching ready (Workbox integration)</li>
                <li>✅ Seeking & progress tracking</li>
                <li>✅ Volume control</li>
                <li>✅ Fullscreen mode</li>
                <li>✅ Mobile responsive design</li>
              </ul>

              <div className="quick-actions">
                <h3>🚀 Quick Actions</h3>
                <button onClick={() => window.open(YOUR_M3U8_URL, '_blank')}>
                  🔗 Open Stream Directly
                </button>
                <button onClick={() => {
                  // Add to home screen on mobile
                  if (window.matchMedia('(display-mode: standalone)').matches) {
                    alert('This is a PWA-ready player');
                  } else {
                    navigator.serviceWorker?.getRegistrations().then(registrations => {
                      registrations.forEach(reg => reg.unregister());
                      window.location.reload();
                    });
                  }
                }}>
                  📱 PWA / Offline Mode Toggle
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="loading-screen">
            <p>Loading player...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with ❤️ • HLS.js + React + Vite</p>
      </footer>
    </div>
  );
}
