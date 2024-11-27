import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MercadoPagoConnect = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMPConnection = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/seller/mp-status`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setIsConnected(response.data.isConnected);
            } catch (error) {
                console.error('Error al verificar conexión:', error);
            } finally {
                setLoading(false);
            }
        };

        checkMPConnection();
    }, []);

    const connectMercadoPago = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/seller/mp-auth-url`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data?.authUrl) {
                window.location.href = response.data.authUrl;
            } else {
                throw new Error('No se recibió URL de autorización');
            }
        } catch (error) {
            console.error('Error al obtener URL de autorización:', error);
            alert('Error al conectar con MercadoPago');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <p>Verificando conexión...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {isConnected ? (
                <div className="flex items-center text-green-600">
                    <svg 
                        className="w-6 h-6 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span className="font-medium">
                        Cuenta conectada con MercadoPago
                    </span>
                </div>
            ) : (
                <div>
                    <p className="text-gray-600 mb-4">
                        Para vender beats en la plataforma, necesitas conectar tu cuenta de MercadoPago.
                        Esto nos permitirá procesar los pagos y enviarte el dinero automáticamente.
                    </p>
                    <Button 
                        onClick={connectMercadoPago}
                        className="w-full sm:w-auto"
                    >
                        Conectar cuenta de MercadoPago
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MercadoPagoConnect;