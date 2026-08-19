import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Customer } from '@businessos/shared';

@ApiTags('Customers & CRM')
@Controller('customers')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission('customers:read')
  @ApiOperation({ summary: 'Get all customers for authenticated organization' })
  async getCustomers(@CurrentUser('organizationId') organizationId: string) {
    return this.customersService.getCustomers(organizationId);
  }

  @Post()
  @RequirePermission('customers:write')
  @ApiOperation({ summary: 'Add a new customer record' })
  async createCustomer(
    @CurrentUser('organizationId') organizationId: string,
    @Body() customerData: Partial<Customer>,
  ) {
    return this.customersService.createCustomer(organizationId, customerData);
  }

  @Get('leads')
  @RequirePermission('customers:read')
  @ApiOperation({ summary: 'Get sales leads pipeline' })
  async getLeads(@CurrentUser('organizationId') organizationId: string) {
    return this.customersService.getLeads(organizationId);
  }

  @Patch('leads/:id/stage')
  @RequirePermission('customers:write')
  @ApiOperation({ summary: 'Update lead pipeline stage' })
  async updateLeadStage(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') leadId: string,
    @Body() body: { stage: string },
  ) {
    return this.customersService.updateLeadStage(organizationId, leadId, body.stage);
  }
}
