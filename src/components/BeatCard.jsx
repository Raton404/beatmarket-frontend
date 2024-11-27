import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from './ui/button';
import AudioPlayer from './AudioPlayer';
import axios from 'axios';

const BeatCard = ({ id, title, description, price, sellerId, beatUrl, genre, duration }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comprar');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/payment/create_preference', {
        description: `Compra del beat: ${title}`,
        title,
        price: Number(price),
        sellerId,
        quantity: 1,
        buyerId: user.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      alert('Error al iniciar la compra. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">{genre} - {duration}</p>
        
        {/* Audio Player */}
        <div className="mb-4">
          <AudioPlayer 
            url={`http://localhost:5000${beatUrl}`}
            title={title}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="font-bold text-xl">${price.toLocaleString()}</span>
          <Button
            onClick={handleBuy}
            disabled={user?.id === sellerId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {user?.id === sellerId ? 'Tu beat' : 'Comprar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BeatCard;