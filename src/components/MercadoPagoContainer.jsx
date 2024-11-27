import React, { useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const MercadoPagoContainer = ({ preferenceId }) => {
  useEffect(() => {
    // Usar la PUBLIC_KEY del backend
    initMercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY);
  }, []);

  return (
    <div className="mercadopago-container">
      <Wallet initialization={{ preferenceId }} />
    </div>
  );
};

export default MercadoPagoContainer;
