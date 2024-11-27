import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import BeatDetail from './components/BeatDetail';
import SellerDashboard from './components/SellerDashboard';
import Success from './components/Success';
import Failure from './components/Failure';
import Pending from './components/Pending';
import SellerSetup from './components/SellerSetup';
import Library from './components/Library';
import PrivateRoute from './components/PrivateRoute';
import BuyerProfile from './components/BuyerProfile';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta principal - Catálogo */}
          <Route path="/" element={<App />} />
          
          {/* Ruta del dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <SellerDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <BuyerProfile />
              </PrivateRoute>
            } 
          />
          
          {/* Detalles del beat */}
          <Route path="/beat/:id" element={<BeatDetail />} />
          
          {/* Rutas protegidas */}
          <Route path="/success" element={<PrivateRoute><Success /></PrivateRoute>} />
          <Route path="/failure" element={<PrivateRoute><Failure /></PrivateRoute>} />
          <Route path="/pending" element={<PrivateRoute><Pending /></PrivateRoute>} />
          <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />
          <Route path="/seller/setup" element={<PrivateRoute><SellerSetup /></PrivateRoute>} />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;