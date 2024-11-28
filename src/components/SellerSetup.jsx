import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SellerSetup = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const connectWithMercadoPago = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/seller/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con MercadoPago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Configuración de Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Para vender beats, necesitas conectar tu cuenta de MercadoPago.
        </p>
        <Button 
          onClick={connectWithMercadoPago} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Conectando...' : 'Conectar con MercadoPago'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SellerSetup;