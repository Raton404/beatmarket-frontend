// src/components/BuyerProfile.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerProfile = () => {
  const { user } = useContext(AuthContext);
  const userInitials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-48">
        <div className="absolute top-4 right-4">
          <Link
            to="/"
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>Ir al Catálogo</span>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-16 flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-white shadow-lg">
              {userInitials}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-sm opacity-90">Miembro desde octubre 2023</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-500 text-sm">Beats Comprados</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-500 text-sm">Total Invertido</h3>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-500 text-sm">Productores Apoyados</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <button className="px-1 py-4 border-b-2 border-blue-600 font-medium text-blue-600">
              Mi Biblioteca
            </button>
            <button className="px-1 py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700">
              Historial de Compras
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Aún no has comprado ningún beat</p>
            <Link 
              to="/" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Explorar Beats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;