import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (query) => {
  try {
    const response = await api.post('/chat', { query });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health Check Failed:', error);
    throw error;
  }
};

export const findDoctors = async (query, location) => {
  try {
    const response = await api.post('/doctors', { query, location });
    return response.data;
  } catch (error) {
    console.error('Doctor Search Failed:', error);
    throw error;
  }
};

export default api;