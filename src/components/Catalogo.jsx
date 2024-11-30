import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Play, 
  Heart, 
  Share2, 
  MoreVertical, 
  Pause, 
  SkipBack,
  SkipForward,
  Volume2 
} from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_URL = 'https://beatmarket-backend.vercel.app';

const Catalogo = ({ 
  showLoginDialog, 
  setShowLoginDialog, 
  showRegisterDialog, 
  setShowRegisterDialog 
}) => {
  const [beats, setBeats] = useState([]);
  const { isAuthenticated, user, login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para los formularios
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [selectedBeat, setSelectedBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(new Audio());
  const [volume, setVolume] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const filteredBeats = selectedGenre
    ? beats.filter(beat => beat.genre.toLowerCase() === selectedGenre.toLowerCase())
    : [];

  // Primero definimos handlePlayBeat
  const handlePlayBeat = useCallback((beat) => {
    const audioUrl = `${API_URL}${beat.beatUrl}`;
    
    if (selectedBeat?.id === beat.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause();
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
      setSelectedBeat(beat);
      setIsPlaying(true);
    }
  }, [selectedBeat, isPlaying]);

  // Luego definimos las funciones que dependen de handlePlayBeat
  const handlePrevTrack = useCallback(() => {
    const currentIndex = beats.findIndex(beat => beat.id === selectedBeat?.id);
    if (currentIndex > 0) {
      const prevBeat = beats[currentIndex - 1];
      handlePlayBeat(prevBeat);
    } else {
      const lastBeat = beats[beats.length - 1];
      handlePlayBeat(lastBeat);
    }
  }, [beats, selectedBeat, handlePlayBeat]);

  const handleNextTrack = useCallback(() => {
    const currentIndex = beats.findIndex(beat => beat.id === selectedBeat?.id);
    if (currentIndex < beats.length - 1) {
      const nextBeat = beats[currentIndex + 1];
      handlePlayBeat(nextBeat);
    } else {
      const firstBeat = beats[0];
      handlePlayBeat(firstBeat);
    }
  }, [beats, selectedBeat, handlePlayBeat]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current.src) {
      return;
    }
  
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleAudioPlay = () => setIsPlaying(true);
    const handleAudioPause = () => setIsPlaying(false);
    const handleAudioEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [handleNextTrack, volume]);
  
  // Effect para manejar la pausa cuando se cambia de pestaña o se pierde el foco
  useEffect(() => {
    const handlePause = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
  
    const handleVisibilityChange = () => {
      if (document.hidden) handlePause();
    };
  
    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePause);
    window.addEventListener('beforeunload', handlePause);
  
    // Limpiar
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePause);
      window.removeEventListener('beforeunload', handlePause);
    };
  }, [isPlaying]);
  
  // Effect para manejar los cambios de ruta
  const location = useLocation();
  useEffect(() => {
    // Función para limpiar el reproductor
    const cleanupPlayer = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        setIsPlaying(false);
        setSelectedBeat(null);
        setProgress(0);
      }
    };

    // Limpiar cuando cambia la ruta
    if (location.pathname !== '/') {
      cleanupPlayer();
    }

    // También limpiar cuando el componente se desmonta
    return () => {
      cleanupPlayer();
    };
  }, [location.pathname]);

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });

  // Estados para errores
  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  // Manejadores de autenticación
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      await login(loginData);
      setShowLoginDialog(false);
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setLoginError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role
      });
      setShowRegisterDialog(false);
    } catch (error) {
      console.error('Error de registro:', error);
      setRegisterError('Error al registrar usuario');
    }
  };

  // Toggle entre diálogos
  const switchToRegister = () => {
    setShowLoginDialog(false);
    setShowRegisterDialog(true);
    setLoginError(null);
  };

  const switchToLogin = () => {
    setShowRegisterDialog(false);
    setShowLoginDialog(true);
    setRegisterError(null);
  };

  // Tu useEffect existente
  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await fetch(`https://beatmarket-backend.vercel.app/api/beats`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setBeats(data);
      } catch (error) {
        console.error('Error al cargar beats:', error);
      }
    };

    fetchBeats();
  }, []);

  const handleBeatClick = (beatId) => {
    navigate(`/beat/${beatId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Beats Destacados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beats.map(beat => (
            <div key={beat.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Imagen del beat */}
              <div className="relative aspect-video">
                <img
                  src={beat.coverUrl ? `${API_URL}${beat.coverUrl}` : `/api/placeholder/400/225`} // Actualizado
                  alt={beat.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay al hacer hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayBeat(beat);
                    }}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {selectedBeat?.id === beat.id && isPlaying ? (
                      <Pause className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Play className="w-6 h-6 text-gray-900" />
                    )}
                  </button>
                </div>
              </div>

              {/* Información del beat */}
              <div className="p-4">
                <div className="mb-2">
                    <p className="text-sm text-gray-600">
                    {beat.sellerName || 'Unknown Artist'}
                  </p>
                  <h3 className="font-semibold text-lg">{beat.title}</h3>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>{beat.bpm} BPM</span>
                    <span>{beat.key}</span>
                    <span>{beat.genre}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4 text-gray-600">
                    <button className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button>
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">
                      ${beat.licenses && beat.licenses.length > 0 
                        ? Math.min(...beat.licenses.map(license => license.price)).toLocaleString()
                        : '0'}
                    </span>
                    <Button
                      onClick={() => navigate(`/beat/${beat.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Ver Licencias
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reproductor Global */}
        {selectedBeat && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-20 flex items-center justify-between px-4 z-50">
            {/* Info del Beat */}
            <div className="flex items-center space-x-4 w-1/4">
              <img 
                src={selectedBeat.coverUrl ? `${API_URL}${selectedBeat.coverUrl}` : `/api/placeholder/40/40`} // Actualizado
                alt={selectedBeat.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-medium text-sm">{selectedBeat.title}</h4>
                <p className="text-xs text-gray-300">{selectedBeat.sellerName || 'Unknown Artist'}</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col items-center w-2/4">
              <div className="flex items-center space-x-4">
                <button 
                  className="text-white hover:text-gray-300 transition-colors"
                  onClick={handlePrevTrack}
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 bg-white rounded-full text-blue-600 hover:bg-gray-200 transition-colors"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button 
                  className="text-white hover:text-gray-300 transition-colors"
                  onClick={handleNextTrack}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full mt-2">
                <div className="bg-gray-600 rounded-full h-1 w-full">
                  <div 
                    className="bg-white rounded-full h-1" 
                    style={{width: `${progress}%`}}
                  />
                </div>
              </div>
            </div>

            {/* Volumen */}
            <div className="flex items-center space-x-4 w-1/4 justify-end">
              <Volume2 className="w-5 h-5" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>
        )}

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Explorar por Género
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Hip Hop', 'Trap', 'R&B', 'Pop', 'Reggaeton', 'Electronic'].map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`rounded-lg border p-4 text-center transition-all duration-200 cursor-pointer
                  ${selectedGenre === genre 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white hover:bg-indigo-50 border-gray-200'}`}
              >
                <span className={`font-medium ${selectedGenre === genre ? 'text-white' : 'text-gray-700'}`}>
                  {genre}
                </span>
                <div className={`text-xs mt-1 ${selectedGenre === genre ? 'text-white' : 'text-gray-500'}`}>
                  {beats.filter(beat => beat.genre.toLowerCase() === genre.toLowerCase()).length} beats
                </div>
              </button>
            ))}
          </div>

          {/* Beats filtrados por género */}
          {selectedGenre && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-6">
                Beats de {selectedGenre}
              </h3>
              {filteredBeats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBeats.map(beat => (
                    <div key={beat.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* La misma estructura de beat card que usas en Beats Destacados */}
                      <div className="relative aspect-video">
                        <img
                          src={beat.coverUrl ? `${API_URL}${beat.coverUrl}` : `/api/placeholder/400/225`} // Actualizado
                          alt={beat.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayBeat(beat);
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors"
                          >
                            {selectedBeat?.id === beat.id && isPlaying ? (
                              <Pause className="w-6 h-6 text-gray-900" />
                            ) : (
                              <Play className="w-6 h-6 text-gray-900" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">{beat.sellerName}</p>
                          <h3 className="font-semibold text-lg">{beat.title}</h3>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>{beat.bpm} BPM</span>
                            <span>{beat.key}</span>
                            <span>{beat.genre}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex space-x-4 text-gray-600">
                            <button className="flex items-center space-x-1">
                              <Play className="w-4 h-4" />
                              <span>0</span>
                            </button>
                            <button className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>0</span>
                            </button>
                            <button>
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold">
                              ${beat.licenses && beat.licenses.length > 0 
                                ? Math.min(...beat.licenses.map(license => license.price)).toLocaleString() 
                                : '0'}
                            </span>
                            <Button
                              onClick={() => navigate(`/beat/${beat.id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                              Ver Licencias
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No hay beats disponibles en este género</p>
                </div>
              )}
            </div>
          )}
        </section>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Sesión</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="text-red-500 text-sm">{loginError}</div>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <Button type="submit">
                  Iniciar Sesión
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={switchToRegister}
                >
                  ¿No tienes cuenta? Regístrate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Registro */}
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <div className="text-red-500 text-sm">{registerError}</div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tipo de Usuario</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={registerData.role === 'buyer'}
                      onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                      className="mr-2"
                    />
                    <span>Comprador</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={registerData.role === 'seller'}
                      onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                      className="mr-2"
                    />
                    <span>Vendedor</span>
                  </label>
                </div>
              </div>
              <Input
                type="text"
                placeholder="Nombre"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                required
              />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
              />
              <div className="flex justify-between items-center">
                <Button type="submit">
                  Registrarse
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={switchToLogin}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Catalogo;