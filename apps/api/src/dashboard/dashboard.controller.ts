import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Business Dashboard Overview')
@Controller('dashboard')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @RequirePermission('org:read')
  @ApiOperation({ summary: 'Get executive dashboard statistics and pulse metrics' })
  async getOverview(@CurrentUser('organizationId') organizationId: string) {
    return this.dashboardService.getOverview(organizationId);
  }
}
