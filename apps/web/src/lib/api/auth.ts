import { apiFetch } from './client';

export const authApi = {
  getMe: () => apiFetch<any>('/auth/me'),
  login: (email: string) => apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
};
