import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-yellow-600">
            Pago Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="mb-6">
              {/* Clock icon */}
              <svg
                className="w-16 h-16 mx-auto text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2">
              Pago en Proceso
            </p>
            <p className="text-muted-foreground mb-4">
              Tu pago está siendo procesado. Te notificaremos cuando se complete.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={() => navigate('/library')}
              className="w-full sm:w-auto"
            >
              Ver Estado de Compra
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

export default Pending;