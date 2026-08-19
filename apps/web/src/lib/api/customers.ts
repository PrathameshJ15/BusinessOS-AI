import { apiFetch } from './client';
import { Customer, Lead } from '@businessos/shared';

export const customersApi = {
  getCustomers: () => apiFetch<Customer[]>('/customers'),
  createCustomer: (customer: Partial<Customer>) =>
    apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(customer) }),
  getLeads: () => apiFetch<Lead[]>('/customers/leads'),
  updateLeadStage: (id: string, stage: string) =>
    apiFetch<Lead>(`/customers/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
};
