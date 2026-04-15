import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ArrowLeft, 
  Settings, 
  Subtitles,
  AudioLines
} from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ media, onClose }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [activeMenu, setActiveMenu] = useState(null); // 'audio' | 'subtitles' | null

  // Mock Tracks
  const audioTracks = ['Español (Latino)', 'Español (España)', 'Inglés (Original)', 'Inglés (Audio Descriptivo)'];
  const subtitleTracks = ['Apagado', 'Español (CC)', 'Inglés'];
  const [selectedAudio, setSelectedAudio] = useState('Español (Latino)');
  const [selectedSubtitle, setSelectedSubtitle] = useState('Apagado');

  useEffect(() => {
    // Intentar auto-play al montar
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay prevent", e));
      setIsPlaying(true);
    }
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Si algún menú está abierto, no ocultar los controles
    if (!activeMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !activeMenu) {
      setShowControls(false);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setShowControls(true); // Mostrar controles siempre al posar
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = clickPercentage * videoRef.current.duration;
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = async (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div 
      className={`video-player-container ${showControls || !isPlaying || activeMenu ? 'show-controls' : 'hide-controls'}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => { setActiveMenu(null); setShowControls(true); }} // Cierra menús al clickear fuera
    >
      <video
        ref={videoRef}
        className="video-element"
        src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      >
        <track kind="captions" />
      </video>

      {/* OVERLAY DE CONTROLES */}
      <div className="player-ui">
        
        {/* HEADER */}
        <div className="player-header fade-element">
          <button className="btn-player-back" onClick={onClose}>
            <ArrowLeft size={28} />
          </button>
          <div className="player-title-info">
            <h2>{media?.title || "Reproduciendo..."}</h2>
          </div>
        </div>

        {/* CUBIERTA CENTRAL DE PLAY/PAUSE AL HACER CLIC */}
        <div className="center-play-pause fade-element" onClick={togglePlay}>
           {!isPlaying && (
             <div className="big-play-btn">
               <Play size={48} fill="currentColor" />
             </div>
           )}
        </div>

        {/* MENÚ DE IDIOMAS Y SUBTÍTULOS */}
        {activeMenu && (
          <div className="settings-menu-overlay fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="settings-menu-content">
              
              <div className="menu-column">
                <div className="menu-header">
                  <AudioLines size={18} />
                  <h3>Audio</h3>
                </div>
                {audioTracks.map(audio => (
                  <div 
                    key={audio} 
                    className={`menu-option ${selectedAudio === audio ? 'selected' : ''}`}
                    onClick={() => { setSelectedAudio(audio); setActiveMenu(null); }}
                  >
                    {audio}
                  </div>
                ))}
              </div>

              <div className="settings-divider"></div>

              <div className="menu-column">
                <div className="menu-header">
                  <Subtitles size={18} />
                  <h3>Subtítulos</h3>
                </div>
                {subtitleTracks.map(sub => (
                  <div 
                    key={sub} 
                    className={`menu-option ${selectedSubtitle === sub ? 'selected' : ''}`}
                    onClick={() => { setSelectedSubtitle(sub); setActiveMenu(null); }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CONTROLS */}
        <div className="player-bottom fade-element" onClick={(e) => e.stopPropagation()}>
          
          <div className="progress-bar-container" onClick={handleProgressClick}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              <div className="progress-bar-thumb" style={{ left: `${progress}%` }}></div>
            </div>
          </div>

          <div className="player-controls-row">
            
            <div className="controls-left">
              <button className="player-icon-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
              
              <div className="volume-container">
                <button className="player-icon-btn" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                  type="range" 
                  className="volume-slider" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange} 
                />
              </div>

              <div className="time-display">
                {currentTime} / {duration}
              </div>
            </div>

            <div className="controls-right">
              <button 
                className="player-icon-btn with-label" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveMenu(activeMenu ? null : 'settings');
                }}
              >
                <Settings size={22} />
                <span>Ajustes</span>
              </button>

              <button className="player-icon-btn" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;
