import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const defaultLicenses = [
  {
    name: 'Licencia Básica',
    price: 15000,
    maxStreams: 2000,
    isExclusive: false,
    includedFiles: ['MP3'],
    commercialUse: false,
    termsAndConditions: 'Uso limitado hasta 2000 reproducciones'
  },
  {
    name: 'Licencia Premium',
    price: 30000,
    maxStreams: 10000,
    isExclusive: false,
    includedFiles: ['MP3', 'WAV'],
    commercialUse: true,
    termsAndConditions: 'Uso comercial hasta 10000 reproducciones'
  },
  {
    name: 'Licencia Exclusiva',
    price: 100000,
    maxStreams: null,
    isExclusive: true,
    includedFiles: ['MP3', 'WAV', 'Stems'],
    commercialUse: true,
    termsAndConditions: 'Derechos exclusivos y transferencia total'
  }
];

const LicenseManager = ({ beatId }) => {
  const [licenses, setLicenses] = useState(defaultLicenses);

  const handleLicenseChange = (index, field, value) => {
    const newLicenses = [...licenses];
    newLicenses[index][field] = value;
    setLicenses(newLicenses);
  };

  const handleSubmit = async () => {
    try {
      // Enviar todas las licencias al servidor
      const promises = licenses.map(license => 
        axios.post(`${API_URL}/api/beats/${beatId}/licenses`, 
          { ...license, beatId },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
      );

      await Promise.all(promises);
      alert('Licencias guardadas exitosamente');
    } catch (error) {
      console.error('Error al guardar licencias:', error);
      alert('Error al guardar las licencias');
    }
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Configurar Licencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {licenses.map((license, index) => (
            <Card key={index} className="p-4">
              <Input
                className="mb-2"
                placeholder="Nombre de la licencia"
                value={license.name}
                onChange={(e) => handleLicenseChange(index, 'name', e.target.value)}
              />
              
              <Input
                className="mb-2"
                type="number"
                placeholder="Precio"
                value={license.price}
                onChange={(e) => handleLicenseChange(index, 'price', Number(e.target.value))}
              />

              <div className="mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={license.commercialUse}
                    onChange={(e) => handleLicenseChange(index, 'commercialUse', e.target.checked)}
                  />
                  <span>Uso Comercial</span>
                </label>
              </div>

              <div className="mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={license.isExclusive}
                    onChange={(e) => handleLicenseChange(index, 'isExclusive', e.target.checked)}
                  />
                  <span>Licencia Exclusiva</span>
                </label>
              </div>

              <textarea
                className="w-full p-2 border rounded mb-2"
                placeholder="Términos y condiciones"
                value={license.termsAndConditions}
                onChange={(e) => handleLicenseChange(index, 'termsAndConditions', e.target.value)}
                rows="3"
              />
            </Card>
          ))}
        </div>
        
        <Button 
          className="w-full mt-4" 
          onClick={handleSubmit}
        >
          Guardar Licencias
        </Button>
      </CardContent>
    </Card>
  );
};

export default LicenseManager;