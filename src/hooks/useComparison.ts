import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { ComparisonResponse } from '../types/comparison'; 
import type { HistoryPoint } from '../pages/comparison/ComparisonPage';

interface UseComparisonParams {
  rangeA: string;
  rangeB: string;
  granularity?: string;
  greenhouseId?: number; 
};

type ComparisonHookResult = ComparisonResponse & {
  seriesA: HistoryPoint[];
  seriesB: HistoryPoint[];
};

export function useComparison({ rangeA, rangeB, granularity, greenhouseId }: UseComparisonParams) {
  return useQuery<ComparisonHookResult>({
    queryKey: ['use-comparison', rangeA, rangeB, granularity, greenhouseId],
    queryFn: async () => {
      // Header para a requisição POST
      const headers = greenhouseId ? { 'x-greenhouse-id': greenhouseId.toString() } : {};
      
      // Parâmetros para as requisições GET
      const paramsA = { date: rangeA, granularity, ...(greenhouseId && { greenhouseId }) };
      const paramsB = { date: rangeB, granularity, ...(greenhouseId && { greenhouseId }) };

      const [comparisonRes, historyARes, historyBRes] = await Promise.all([
        api.post('comparison/compare', { rangeA, rangeB }, { headers }),
        api.get('data/history', { params: paramsA }),
        api.get('data/history', { params: paramsB })
      ]);

      return {
        ...comparisonRes.data, 
        seriesA: historyARes.data.records,
        seriesB: historyBRes.data.records
      };
    },
    enabled: !!rangeA && !!rangeB 
  });
}