import { apiFetch } from './client';
import { Campaign, Review } from '@businessos/shared';

export const campaignsApi = {
  getCampaigns: () => apiFetch<Campaign[]>('/marketing/campaigns'),
  createCampaign: (campaign: Partial<Campaign>) =>
    apiFetch<Campaign>('/marketing/campaigns', { method: 'POST', body: JSON.stringify(campaign) }),
  getReviews: () => apiFetch<Review[]>('/marketing/reviews'),
  replyToReview: (id: string, responseText: string) =>
    apiFetch<Review>(`/marketing/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify({ responseText }) }),
};
