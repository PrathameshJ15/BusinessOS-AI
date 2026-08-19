import { apiFetch } from './client';
import { Booking, Service, Staff } from '@businessos/shared';

export const bookingsApi = {
  getBookings: () => apiFetch<Booking[]>('/bookings'),
  createBooking: (booking: Partial<Booking>) =>
    apiFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  getServices: () => apiFetch<Service[]>('/bookings/services'),
  getStaff: () => apiFetch<Staff[]>('/bookings/staff'),
};
