import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DashboardData } from '../types/dashboardData';
import type { TemperatureHistoryResponse } from '../types';

export function useDashboard(greenhouseId?: number) {
  return useQuery({
    queryKey: ['dashboard-stats', greenhouseId],
    queryFn: async () => {
      const params = greenhouseId ? { greenhouseId } : {};
      
      const [lastRes, historyRes] = await Promise.all([
        api.get('/data/lastdata', { params }),
        api.get('/data/history1h', { params })
      ]);

      return {
        lastRecord: lastRes.data.lastRecord,
        statistics: historyRes.data.statistics
      } as DashboardData;
    },
    refetchInterval: 60000, 
  });
};

export function useHistory(greenhouseId?: number) {
  return useQuery({
    queryKey: ['use-history', greenhouseId],
    queryFn: async () => {
      try {
        const params = greenhouseId ? { greenhouseId } : {};
        const [ historyRes] = await Promise.all([
          api.get('data/history1h', { params })
        ]);

        return {
          records: historyRes.data.records || [], 
          statistics: historyRes.data.statistics
        } as TemperatureHistoryResponse;
      } catch (err) {
        console.error("Erro na requisição do Dashboard:", err);
        throw err;
      }
    },
    refetchInterval: 60000, 
  });
};

export function useData(
  filters: { date: string; start?: string; end?: string; granularity?: string },
  greenhouseId?: number
) {
  return useQuery({
    queryKey: ['use-data', filters, greenhouseId],
    queryFn: async () => {
      try {
        // Junta os filtros com o greenhouseId (se existir)
        const params = { ...filters, ...(greenhouseId && { greenhouseId }) };
        
        const [dataResponse] = await Promise.all([
          api.get('data/history', { params })
        ]);
        
        return {
          records: dataResponse.data.records || [],
          statistics: dataResponse.data.statistics,
        } as TemperatureHistoryResponse;
      } catch (err: unknown) {
        console.error('Erro ao obter Histórico na data solicitada');
        throw err;
      }
    }
  })
};