import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Hook para obtener métricas del dashboard omnicanal
export const useOmnichannelDashboard = (period = 'monthly') => {
  return useQuery({
    queryKey: ['omnichannel-dashboard', period],
    queryFn: async () => {
      const response = await api.get(`/dashboard/omnichannel?period=${period}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 2 * 60 * 1000, // Refetch cada 2 minutos
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook para obtener métricas en tiempo real
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/realtime');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook para obtener resumen ejecutivo
export const useExecutiveSummary = (period = 'monthly') => {
  return useQuery({
    queryKey: ['executive-summary', period],
    queryFn: async () => {
      const response = await api.get(`/dashboard/executive-summary?period=${period}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: 1000,
  });
};
