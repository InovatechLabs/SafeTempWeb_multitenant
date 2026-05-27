import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-platform': 'web' 
  }
});

let inMemoryToken: string | null = null;
let activeGreenhouseId: number | null = null;

export const setInMemoryToken = (token: string | null) => {
  inMemoryToken = token;
};
  
export const setActiveGreenhouseId = (id: number | null) => {
  activeGreenhouseId = id;
};

export const getInMemoryToken = () => inMemoryToken;

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  if (activeGreenhouseId) {
    config.headers['x-greenhouse-id'] = activeGreenhouseId.toString();
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

// @ts-ignore
let isAuthenticated = false;

export const setAuthState = (value: boolean) => {
  isAuthenticated = value;
};

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config; 

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/refresh') ||
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/verify-login-code') || 
      originalRequest.url?.includes('/verify-backup-code') ||
      originalRequest.url?.includes('/me')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {

      const refreshResponse = await api.post('user/refresh');
      const newAccessToken = refreshResponse.data.accessToken;
      setInMemoryToken(newAccessToken); 

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null);
      setAuthState(true);

      queryClient.invalidateQueries({ queryKey: ['authUser'], refetchType: 'all' });

      return api(originalRequest);
    } catch (refreshError) {

      processQueue(refreshError);
      setAuthState(false);
      
      setInMemoryToken(null);
      queryClient.setQueryData(['authUser'], null);

      const publicRoutes = ['/login', '/register', '/recover', '/recover/:token', '/', '/home', '/dashboard', '/historico', '/historico/relatorios', '/historico/comparar'];
      const isPublicRoute = publicRoutes.some(route =>
        window.location.pathname === route ||
        window.location.pathname.startsWith('/recover/')
      );

      const isSilentAuthCheck = originalRequest.url?.includes('/me');

        if (!isPublicRoute && !isSilentAuthCheck) {
        window.location.href = '/login';
        }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;