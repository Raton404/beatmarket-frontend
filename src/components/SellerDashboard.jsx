import React from 'react';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import MercadoPagoConnect from './MercadoPagoConnect';
import { beatService } from '../services/beatService';
import LicenseManager from './LicenseManager';
import { Link } from 'react-router-dom';
import { 
  Music, 
  Share2, 
  Heart, 
  Settings, 
  Upload, 
  DollarSign,
  Users,
  BarChart2,
  Edit,
  MoreVertical,
  Trash2,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Home // Añadimos el ícono Home
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from 'axios';

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('beats');
  const [beats, setBeats] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLicenseManager, setShowLicenseManager] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    genre: '',
    description: '',
    duration: '',
    bpm: '',
    key: '',
    beatFile: null,
    coverImage: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Agregar estos dos estados que faltan
  const [formErrors, setFormErrors] = useState({});
  const [uploadedBeatId, setUploadedBeatId] = useState(null);

  // Estados del reproductor de audio
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(new Audio());
  const [volume, setVolume] = useState(1); // Valor entre 0 y 1

  const handleSkipBeat = (direction) => {
    if (!selectedBeat || beats.length === 0) return;
    
    const currentIndex = beats.findIndex(beat => beat.id === selectedBeat.id);
    let nextIndex;
    
    if (direction === 'forward') {
      nextIndex = currentIndex + 1 >= beats.length ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex - 1 < 0 ? beats.length - 1 : currentIndex - 1;
    }
    
    handlePlayBeat(beats[nextIndex]);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  // Asegurarse de que el volumen se mantenga cuando cambia la canción
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [selectedBeat]);

  const handlePlayBeat = (beat) => {
    const audioUrl = `${API_URL}${beat.beatUrl}`;
    
    if (selectedBeat?.id === beat.id) {
      // Si es el mismo beat, toggle play/pause
      togglePlay();
    } else {
      // Si es un nuevo beat
      audioRef.current.src = audioUrl;
      setSelectedBeat(beat);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  // Limpia el audio cuando el componente se desmonta
  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  // Load seller's beats on component mount
  useEffect(() => {
    const loadBeats = async () => {
      try {
        const data = await beatService.getSellerBeats();
        setBeats(data);
      } catch (error) {
        console.error('Error loading beats:', error);
      }
    };
    loadBeats();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!uploadData.title.trim()) errors.title = 'El título es requerido';
    if (!uploadData.genre) errors.genre = 'El género es requerido';
    if (!uploadData.beatFile) errors.beatFile = 'El archivo de audio es requerido';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      Object.keys(uploadData).forEach(key => {
        if (key !== 'beatFile' && key !== 'coverImage') {
          formData.append(key, uploadData[key]);
        }
      });

      // Agregar archivos
      if (uploadData.beatFile) {
        formData.append('beatFile', uploadData.beatFile);
      }
      if (uploadData.coverImage) {
        formData.append('coverImage', uploadData.coverImage);
      }

      const response = await axios.post(
        `${API_URL}/api/beats/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status === 201) {
        setUploadedBeatId(response.data.beat.id);
        setShowUploadDialog(false);
        setShowLicenseManager(true);
        setBeats([response.data.beat, ...beats]);
      }
    } catch (error) {
      console.error('Error uploading beat:', error);
      alert(error.response?.data?.error || 'Error al subir el beat. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setUploadData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleLicenseComplete = () => {
    setShowLicenseManager(false);
    setUploadedBeatId(null);
    setUploadData({
      title: '',
      genre: '',
      description: '',
      duration: '',
      bpm: '',
      key: '',
      beatFile: null,
      coverImage: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="absolute top-4 right-4 flex space-x-4">
          <Link
            to="/"
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>Ir al Catálogo</span>
          </Link>
          
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={user?.avatar || "/api/placeholder/150/150"} 
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">@{user?.username || user?.name.toLowerCase().replace(' ', '')}</p>
              <p className="mt-2 text-gray-700">Beatmaker from Chile 🇨🇱 | Trap | Hip Hop | R&B</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                Edit Profile
              </button>
              <button className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Plays</p>
                  <p className="text-xl font-bold">50,000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Followers</p>
                  <p className="text-xl font-bold">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold">789</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Beats</p>
                  <p className="text-xl font-bold">{beats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MercadoPago Connection - AGREGAR ESTA SECCIÓN */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Conexión con MercadoPago</CardTitle>
            </CardHeader>
            <CardContent>
              <MercadoPagoConnect />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['beats', 'stats', 'sales', 'followers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="py-8">
        {activeTab === 'beats' && (
          <>
            {/* Upload Beat Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <button className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition">
                  <Upload className="w-5 h-5" />
                  <span>Upload New Beat</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload New Beat</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your new beat.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  {/* ... contenido del formulario ... */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Título *</label>
                      <input
                        type="text"
                        name="title"
                        value={uploadData.title}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${formErrors.title ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Género *</label>
                      <select
                        name="genre"
                        value={uploadData.genre}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${formErrors.genre ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Seleccionar género</option>
                        <option value="Hip Hop">Hip Hop</option>
                        <option value="Trap">Trap</option>
                        <option value="R&B">R&B</option>
                        <option value="Pop">Pop</option>
                        <option value="Reggaeton">Reggaeton</option>
                      </select>
                      {formErrors.genre && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.genre}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">BPM</label>
                        <input
                          type="number"
                          name="bpm"
                          value={uploadData.bpm}
                          onChange={handleInputChange}
                          placeholder="Ej: 140"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tonalidad</label>
                        <input
                          type="text"
                          name="key"
                          value={uploadData.key}
                          onChange={handleInputChange}
                          placeholder="Ej: Am, C, Dm"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        name="description"
                        value={uploadData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                        placeholder="Describe tu beat..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Duración</label>
                      <input
                        type="text"
                        name="duration"
                        value={uploadData.duration}
                        onChange={handleInputChange}
                        placeholder="Ej: 2:30"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Archivo Beat *</label>
                      <input
                        type="file"
                        name="beatFile"
                        onChange={handleFileChange}
                        accept="audio/*"
                        className={`w-full p-2 border rounded-md ${formErrors.beatFile ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.beatFile && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.beatFile}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Imagen de Portada</label>
                      <input
                        type="file"
                        name="coverImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Subiendo...' : 'Subir Beat'}
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* License Manager Dialog */}
            {showLicenseManager && uploadedBeatId && (
              <Dialog open={showLicenseManager} onOpenChange={(open) => {
                if (!open) handleLicenseComplete();
              }}>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>Configurar Licencias</DialogTitle>
                    <DialogDescription>
                      Configura las licencias para tu beat
                    </DialogDescription>
                  </DialogHeader>
                  <LicenseManager 
                    beatId={uploadedBeatId} 
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Reproductor de Audio Global */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-20 flex items-center justify-between px-4 z-50">
              {selectedBeat && (
                <>
                  {/* Información del Beat */}
                  <div className="flex items-center space-x-4 w-1/4">
                    <img 
                      src={beat.coverUrl ? `${API_URL}${beat.coverUrl}` : `/api/placeholder/400/400`} // Actualizado
                      alt={beat.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/400/400";
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-sm">{selectedBeat.title}</h4>
                      <p className="text-xs text-gray-300">{user?.name}</p>
                    </div>
                  </div>

                  {/* Controles de Reproducción */}
                  <div className="flex flex-col items-center w-2/4">
                    <div className="flex items-center space-x-4">
                      <button 
                        className="text-white hover:text-gray-300"
                        onClick={() => handleSkipBeat('backward')}
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 bg-white rounded-full text-blue-600 hover:bg-gray-200"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <button 
                        className="text-white hover:text-gray-300"
                        onClick={() => handleSkipBeat('forward')}
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                  </div>
                    {/* Barra de Progreso */}
                    <div className="w-full mt-2">
                      <div className="bg-gray-600 rounded-full h-1 w-full">
                        <div 
                          className="bg-white rounded-full h-1" 
                          style={{width: `${progress}%`}}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Controles de Volumen */}
                  <div className="flex items-center space-x-4 w-1/4 justify-end">
                    <Volume2 className="w-5 h-5" />
                    <div className="w-32">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beats.map((beat) => (
                  <Card key={beat.id} className="relative group">
                  <CardContent className="p-4">
                    <div className="relative">
                      {/* Imagen del beat con URL correcta */}
                      <img 
                        src={beat.coverUrl ? `${API_URL}${beat.coverUrl}` : `/api/placeholder/400/400`} // Actualizado
                        alt={beat.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/400/400";
                        }}
                      />
                      <button 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => handlePlayBeat(beat)}
                      >
                        <Play className="w-12 h-12 text-white" />
                      </button>

                      {/* Menú de opciones */}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 bg-white rounded-full shadow-lg">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-4">
                      {/* Nombre del vendedor y título */}
                      <p className="text-sm text-gray-600 mb-1">
                        {user?.name || 'Unknown Artist'}
                      </p>
                      <h3 className="text-lg font-semibold">{beat.title}</h3>
                      
                      {/* Detalles técnicos */}
                      <div className="mt-2 flex justify-between text-sm text-gray-600">
                        <span>{beat.bpm || '-'} BPM</span>
                        <span>{beat.key || '-'}</span>
                        <span className="capitalize">{beat.genre}</span>
                      </div>
            
                      {/* Estadísticas y precio */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Play className="w-4 h-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4" />
                          </div>
                        </div>
                        {/* Precio desde las licencias */}
                        <span className="text-lg font-bold">
                          ${beat.licenses && beat.licenses.length > 0 
                            ? Math.min(...beat.licenses.map(license => license.price)).toLocaleString() 
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart2 className="w-12 h-12" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Additional Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Beats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {beats.slice(0, 5).map((beat) => (
                        <div key={beat.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={beat.thumbnail || "/api/placeholder/40/40"}
                              alt={beat.title}
                              className="w-10 h-10 rounded"
                            />
                            <div>
                              <p className="font-medium">{beat.title}</p>
                              <p className="text-sm text-gray-500">{beat.plays} plays</p>
                            </div>
                          </div>
                          <span className="font-semibold">${beat.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Placeholder for recent sales */}
                      <div className="text-center text-gray-500 py-8">
                        No recent sales to display
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Sales data will be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Follower list will be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;