import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export const useHealthQuery = () => useQuery({ queryKey: ['health'], queryFn: () => api.getHealth() });
export const useSessionsQuery = () => useQuery({ queryKey: ['sessions'], queryFn: () => api.getSessions() });
export const useDashboardStatsQuery = () => useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.getDashboardStats() });
export const useCamerasQuery = () => useQuery({ queryKey: ['cameras'], queryFn: () => api.getCameras() });
export const useReportsQuery = () => useQuery({ queryKey: ['reports'], queryFn: () => api.getReports() });

export const useDetectionsQuery = (params?: Record<string, string>) => useQuery({
  queryKey: ['detections', params],
  queryFn: () => api.getDetections(params),
});

export const useCreateSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createSession(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
};
