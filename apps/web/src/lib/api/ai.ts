import { apiFetch } from './client';

export const aiApi = {
  processMessage: (prompt: string, provider?: string) =>
    apiFetch<any>('/ai/messages', { method: 'POST', body: JSON.stringify({ prompt, provider }) }),
};
