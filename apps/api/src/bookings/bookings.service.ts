import { Injectable, ConflictException } from '@nestjs/common';
import { dbRepository } from '@businessos/database';
import { Booking } from '@businessos/shared';

@Injectable()
export class BookingsService {
  async getBookings(organizationId: string) {
    return dbRepository.getBookings(organizationId);
  }

  async getServices(organizationId: string) {
    return dbRepository.getServices(organizationId);
  }

  async getStaff(organizationId: string) {
    return dbRepository.getStaff(organizationId);
  }

  async createBooking(organizationId: string, bookingData: Partial<Booking>) {
    // Conflict Detection Logic: Check if staff member already has an overlapping appointment
    const existingBookings = dbRepository.getBookings(organizationId);
    const hasConflict = existingBookings.some(
      (b) =>
        b.staffId === bookingData.staffId &&
        b.status === 'CONFIRMED' &&
        b.startTime === bookingData.startTime
    );

    if (hasConflict) {
      throw new ConflictException('Selected staff member already has a confirmed appointment at this slot time.');
    }

    return dbRepository.addBooking(organizationId, bookingData);
  }
}
