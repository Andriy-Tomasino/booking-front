import axios from 'axios';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
});

export const getComputers = async (token: string) => {
  const response = await api.get('/computers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUserBookings = async (token: string) => {
  const response = await api.get('/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};