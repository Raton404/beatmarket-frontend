import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

const AudioPlayer = ({ url, title }) => {
  // Estados
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Referencias
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Asegurarse de que la URL sea absoluta
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;

  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    // Cleanup
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Funciones de control
  const togglePlay = async () => {
    try {
      if (!isPlaying) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    audioRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleProgress = (e) => {
    const time = (e.target.value / 100) * duration;
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  const skipTime = (direction) => {
    const newTime = currentTime + (direction * 10);
    if (newTime >= 0 && newTime <= duration) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-50 rounded-lg p-4 shadow-sm border border-neutral-200">
      <audio ref={audioRef} src={fullUrl} preload="metadata" />
      
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-medium text-neutral-800 truncate">{title}</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleProgress}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3ba1ff ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%)`
          }}
        />
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => skipTime(-1)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Retroceder 10 segundos"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full hover:shadow-md transition-all duration-200"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? 
              <Pause className="w-6 h-6" /> : 
              <Play className="w-6 h-6" />
            }
          </button>

          <button 
            onClick={() => skipTime(1)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Avanzar 10 segundos"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-neutral-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-neutral-600" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Control de volumen"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
