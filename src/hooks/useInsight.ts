import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import type { GreenhouseContext } from '../types/insightContext';

export const useGenerateInsight = (greenhouseId?: number) => {

  return useMutation({
    mutationFn: async (payload: GreenhouseContext) => {
      const headers = greenhouseId ? { 'x-greenhouse-id': greenhouseId.toString() } : {};
      
      const { data } = await api.post(
        `insights/quick-insight`, 
        payload, 
        { 
          withCredentials: true,
          headers 
        }
      );
      
      return data; 
    },
  });
};