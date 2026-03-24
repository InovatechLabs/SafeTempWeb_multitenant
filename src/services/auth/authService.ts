import type { LoginCredentials, RegisterCredentials } from '../../types/auth';
import api from '../api';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('user/login', credentials);
    return response;
  },
  
  register: async (userData: RegisterCredentials) => {
    const response = await api.post('user/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('user/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('user/me');
        console.log('getCurrentUser response:', response.data);
    return response.data;
  }
};