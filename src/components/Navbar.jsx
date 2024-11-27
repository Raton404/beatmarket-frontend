import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onOpenLogin, onOpenRegister }) => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-lg font-semibold">
            {isAuthenticated ? (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.role === 'seller' ? 'Vendedor' : 'Comprador'}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-lg font-semibold">Home</span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Login
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {user?.role === 'seller' && (
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  to="/library" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Library
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
                
                {user?.role === 'buyer' && (
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Mi Perfil
                </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;