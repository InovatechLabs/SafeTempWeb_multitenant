import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

interface CreateGreenhousePayload {
  name: string;
  isPublic?: boolean;
  allowExperiments?: boolean;
  workspaceId?: number;
}

interface CreateGreenhouseResponse {
  message: string;
  greenhouse: { id: number; name: string };
  activationToken: string; // 
}

export const useCreateGreenhouse = () => {
  return useMutation({
    mutationFn: async (payload: CreateGreenhousePayload) => {
      const { data } = await api.post<CreateGreenhouseResponse>('greenhouses', payload);
      return data;
    },
  });
};