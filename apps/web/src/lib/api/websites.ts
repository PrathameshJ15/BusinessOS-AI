import { apiFetch } from './client';
import { Website } from '@businessos/shared';

export const websitesApi = {
  getWebsite: () => apiFetch<Website>('/websites'),
  updateWebsiteBlock: (blockId: string, content: any) =>
    apiFetch<Website>(`/websites/blocks/${blockId}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  togglePublish: () => apiFetch<Website>('/websites/publish', { method: 'POST' }),
};
