import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export const useHealthQuery = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
  });
};

export const useSessionsQuery = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.getSessions(),
  });
};

export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });
};

export const useDetectionsQuery = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['detections', params],
    queryFn: () => api.getDetections(params),
  });
};

export const useCreateSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
