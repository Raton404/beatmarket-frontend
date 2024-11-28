import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const beatService = {
  uploadBeat: async (beatData) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Añadir todos los campos al FormData
    Object.keys(beatData).forEach(key => {
      formData.append(key, beatData[key]);
    });

    const response = await axios.post(`${API_URL}/beats/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getSellerBeats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/beats/seller`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  deleteBeat: async (beatId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/beats/${beatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateBeat: async (beatId, beatData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/beats/${beatId}`, beatData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};