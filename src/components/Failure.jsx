import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const Failure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-red-600">
            Error en el Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="mb-6">
              {/* X icon */}
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2">
              No se pudo procesar el pago
            </p>
            <p className="text-muted-foreground mb-4">
              Hubo un problema al procesar tu pago. No te preocupes, no se realizó ningún cargo.
            </p>
            {searchParams.get('error') && (
              <div className="bg-destructive/10 p-4 rounded-lg mb-6">
                <p className="text-sm text-destructive">
                  Error: {searchParams.get('error')}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Intentar Nuevamente
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

export default Failure;