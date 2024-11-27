import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const Success = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const merchantOrderId = searchParams.get('merchant_order_id');

        setOrderDetails({
          paymentId,
          status,
          merchantOrderId
        });

      } catch (error) {
        console.error('Error al cargar detalles de la orden:', error);
      }
    };

    loadOrderDetails();
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-green-600">
            ¡Compra Exitosa!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="mb-6">
              {/* Checkmark icon */}
              <svg
                className="w-16 h-16 mx-auto text-green-500"
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
            </div>
            <p className="text-xl font-semibold mb-2">
              ¡Gracias por tu compra!
            </p>
            <p className="text-muted-foreground mb-4">
              Tu pago ha sido procesado exitosamente.
            </p>
            {orderDetails && (
              <div className="bg-accent/50 p-4 rounded-lg mb-6 text-sm space-y-1">
                <p>ID de Pago: {orderDetails.paymentId}</p>
                <p>Estado: {orderDetails.status}</p>
                <p>Orden: {orderDetails.merchantOrderId}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={() => navigate('/library')}
              className="w-full sm:w-auto"
            >
              Ver Mis Compras
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;