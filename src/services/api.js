import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const beatService = {
  uploadBeat: async (beatData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/beats/upload`, beatData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getAllBeats: async () => {
    const response = await axios.get(`${API_URL}/beats`);
    return response.data;
  }
};