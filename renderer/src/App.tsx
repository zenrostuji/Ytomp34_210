import React, { useEffect } from 'react';
import { Activity, CheckCircle2, ChevronRight, Clock3, Film, Gauge, History, Link2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { useIPC } from './hooks/useIPC';
import { ThemeToggle } from './components/ThemeToggle';
import { URLInput } from './components/URLInput';
import { BatchDownload } from './components/BatchDownload';
import { VideoInfo } from './components/VideoInfo';
import { FormatSelector } from './components/FormatSelector';
import { DownloadQueue } from './components/DownloadQueue';
import { Settings } from './components/Settings';
import { Donation } from './components/Donation';
import { ErrorNotification } from './components/ErrorNotification';
import { getErrorDisplay } from './constants/errorMessages';

const WindowControls: React.FC = () => (
  <div className="window-controls z-50" onDoubleClick={(e) => e.stopPropagation()}>
    <button aria-label="Minimize" onClick={() => window.electronAPI.window.minimize()} style={{ WebkitAppRegion: 'no-drag' }}>−</button>
    <button aria-label="Maximize" onClick={() => window.electronAPI.window.toggleMaximize()} style={{ WebkitAppRegion: 'no-drag' }}>□</button>
    <button aria-label="Close" className="close" onClick={() => window.electronAPI.window.close()} style={{ WebkitAppRegion: 'no-drag' }}>×</button>
  </div>
);

export const App: React.FC = () => {
  const { error, setError, downloadQueue } = useAppStore();
  const { getSettings } = useIPC();

  useEffect(() => {
    const loadSettings = async () => {
      try { setError(null); await getSettings(); setError(null); }
      catch (err) { setError({ type: 'unknown', message: `Failed to load settings: ${err instanceof Error ? err.message : 'Unknown error'}` }); }
    };
    loadSettings();
  }, [getSettings, setError]);

  const active = downloadQueue.filter(t => ['pending','downloading','paused'].includes(t.status)).length;
  const completed = downloadQueue.filter(t => t.status === 'completed').length;

  return (
    <div className="app-shell">
      <header className="titlebar">
        <div className="titlebar-brand">
          <img src="./icon.png" alt="Ytomp34[210]" />
          <div><strong>Ytomp34[210]</strong><span>Video Downloader</span></div>
        </div>
        <div className="titlebar-actions">
          <Donation /><Settings /><ThemeToggle /> <WindowControls />
        </div>
      </header>

      <main className="app-main">
        {error && <ErrorNotification error={{ ...getErrorDisplay(error.type), message: error.message || getErrorDisplay(error.type).message }} onDismiss={() => setError(null)} />}

        <section className="hero-card ambient-card">
          <div className="hero-copy">
            <div className="status-pill"><span className="status-dot" /> READY TO DOWNLOAD</div>
            <h1>Download videos <em>beautifully.</em></h1>
            <p>Paste a link, choose your quality, and Ytomp34[210] handles the video + audio merge into one final MP4 file.</p>
            <div className="hero-url"><URLInput /></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="art-icon"><Film /></div>
            <span className="particle p1"/><span className="particle p2"/><span className="particle p3"/>
          </div>
        </section>

        <section className="feature-strip">
          <div><ShieldCheck/><span><b>One final MP4</b><small>Video + audio merged</small></span></div>
          <div><Zap/><span><b>Fast & reliable</b><small>Smart retries</small></span></div>
          <div><Gauge/><span><b>High quality</b><small>Best available stream</small></span></div>
          <div><Sparkles/><span><b>Clean output</b><small>No extra files</small></span></div>
        </section>

        <section className="workspace-grid">
          <div className="primary-column">
            <div className="section-heading"><div><span className="eyebrow">PREVIEW</span><h2>Video details</h2></div><Link2/></div>
            <VideoInfo />
            <FormatSelector />
          </div>
          <aside className="side-column">
            <div className="section-heading"><div><span className="eyebrow">BATCH TOOLS</span><h2>More downloads</h2></div><ChevronRight/></div>
            <BatchDownload />
            <div className="mini-stats">
              <div><Activity/><span><b>{active}</b><small>Active</small></span></div>
              <div><CheckCircle2/><span><b>{completed}</b><small>Completed</small></span></div>
              <div><Clock3/><span><b>{downloadQueue.length}</b><small>Total</small></span></div>
            </div>
          </aside>
        </section>

        <section className="queue-section ambient-card">
          <div className="section-heading queue-heading"><div><span className="eyebrow">DOWNLOADS</span><h2><History/> Queue & History</h2></div><span className="live-indicator"><i/> Live queue</span></div>
          <DownloadQueue />
        </section>
      </main>

      <footer className="app-footer"><span>Ytomp34[210] • v2.0.0</span><div className="footer-wave"><i/><i/><i/><i/><i/></div><span>Powered by yt-dlp + FFmpeg</span></footer>
    </div>
  );
};
