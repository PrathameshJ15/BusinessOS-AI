import { apiFetch } from './client';

export const dashboardApi = {
  getOverview: () => apiFetch<any>('/dashboard/overview'),
  getTasks: () => apiFetch<any[]>('/tasks'),
  toggleTaskStatus: (taskId: string) => apiFetch<any>(`/tasks/${taskId}/toggle`, { method: 'PATCH' }),
};
