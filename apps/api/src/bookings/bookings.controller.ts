import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Booking } from '@businessos/shared';

@ApiTags('Bookings & Staff Schedules')
@Controller('bookings')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @RequirePermission('bookings:read')
  @ApiOperation({ summary: 'Get all scheduled appointments' })
  async getBookings(@CurrentUser('organizationId') organizationId: string) {
    return this.bookingsService.getBookings(organizationId);
  }

  @Post()
  @RequirePermission('bookings:write')
  @ApiOperation({ summary: 'Book a new appointment with slot conflict protection' })
  async createBooking(
    @CurrentUser('organizationId') organizationId: string,
    @Body() bookingData: Partial<Booking>,
  ) {
    return this.bookingsService.createBooking(organizationId, bookingData);
  }

  @Get('services')
  @RequirePermission('bookings:read')
  @ApiOperation({ summary: 'Get active service catalog' })
  async getServices(@CurrentUser('organizationId') organizationId: string) {
    return this.bookingsService.getServices(organizationId);
  }

  @Get('staff')
  @RequirePermission('bookings:read')
  @ApiOperation({ summary: 'Get staff roster and duty availability' })
  async getStaff(@CurrentUser('organizationId') organizationId: string) {
    return this.bookingsService.getStaff(organizationId);
  }
}
