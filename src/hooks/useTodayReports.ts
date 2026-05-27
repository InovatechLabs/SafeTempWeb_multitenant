import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTodayReports = (greenhouseId?: number) => {
  return useQuery({
    queryKey: ['today-reports', greenhouseId],
    queryFn: async () => {
      const response = await api.get('reports/today');
      return response.data;
    },
    enabled: !!greenhouseId, 
  });
};