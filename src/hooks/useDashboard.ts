import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DashboardData } from '../types/dashboardData';
import type { TemperatureHistoryResponse } from '../types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [lastRes, historyRes] = await Promise.all([
        api.get('/data/lastdata'),
        api.get('/data/history1h')
      ]);

      return {
        lastRecord: lastRes.data.lastRecord,
        statistics: historyRes.data.statistics
      } as DashboardData;
    },
    refetchInterval: 60000, 
  });
};

export function useHistory() {
  return useQuery({
    queryKey: ['use-history'],
    queryFn: async () => {
      try {
        const [ historyRes] = await Promise.all([
          api.get('data/history1h')
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

  export function useData(filters: 
    { 
      date: string; start?: string; end?: string; granularity?: string 
    }) {
      return useQuery({
        queryKey: ['use-data', filters],
        queryFn: async () => {
          try {
          const [dataResponse] = await Promise.all([
            api.get('data/history', { params: filters })
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