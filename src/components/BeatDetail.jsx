import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import AudioPlayer from './AudioPlayer';
import axios from 'axios';

const BeatDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [beat, setBeat] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(null);

  useEffect(() => {
    const fetchBeatDetails = async () => {
      try {
        const [beatResponse, licensesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/beats/${id}`),
          axios.get(`http://localhost:5000/api/beats/${id}/licenses`)
        ]);

        setBeat(beatResponse.data);
        setLicenses(licensesResponse.data);
      } catch (error) {
        console.error('Error al cargar detalles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeatDetails();
  }, [id]);

  const handleBuy = async (licenseId) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comprar');
      return;
    }

    try {
      console.log('Enviando datos:', {
        title: beat.title,
        licenseId,
        sellerId: beat.sellerId,
        buyerId: user.id
    });
      const response = await axios.post(
        'http://localhost:5000/api/payment/create-preference',
        {
          title: beat.title,
          licenseId,
          sellerId: beat.sellerId,
          buyerId: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.init_point) {
        // Redirigir a MercadoPago
        
        window.location.href = response.data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }

    } catch (error) {
      console.error('Error detallado:', error.response?.data || error);
      alert('Error al procesar la compra');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando detalles del beat...</p>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="text-center py-8">
        <p>Beat no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sección izquierda: Detalles del beat */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{beat.title}</h1>
          
          {beat.coverUrl && (
            <img 
              src={beat.coverUrl}
              alt={beat.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          <AudioPlayer url={beat.beatUrl} />

          <div className="mt-4 space-y-2">
            <p className="text-lg"><span className="font-semibold">Productor:</span> {beat.sellerName}</p>
            <p><span className="font-semibold">Género:</span> {beat.genre}</p>
            <p><span className="font-semibold">BPM:</span> {beat.bpm}</p>
            <p><span className="font-semibold">Tonalidad:</span> {beat.key}</p>
            {beat.description && (
              <p className="mt-4">{beat.description}</p>
            )}
          </div>
        </div>

        {/* Sección derecha: Licencias */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Licencias Disponibles</h2>
          <div className="space-y-4">
            {licenses.map(license => (
              <Card 
                key={license.id}
                className={`hover:shadow-lg transition cursor-pointer ${
                  selectedLicense?.id === license.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedLicense(license)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{license.name}</h3>
                      <p className="text-2xl font-bold text-primary mt-2">
                        ${license.price?.toLocaleString()} CLP
                      </p>
                    </div>
                    {license.isExclusive && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        Exclusiva
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p>• Reproducciones: {license.maxStreams || 'Ilimitadas'}</p>
                    <p>• {license.commercialUse ? 'Uso comercial permitido' : 'Sin uso comercial'}</p>
                    <p>• Archivos incluidos: {license.includedFiles?.join(', ') || 'MP3'}</p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleBuy(license.id)}
                    disabled={user?.id === beat.sellerId || (license.isExclusive && license.sold)}
                  >
                    {user?.id === beat.sellerId 
                      ? 'Tu beat' 
                      : license.isExclusive && license.sold 
                        ? 'Vendida' 
                        : 'Comprar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeatDetail;