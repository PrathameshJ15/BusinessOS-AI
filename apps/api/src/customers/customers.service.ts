import { Injectable, NotFoundException } from '@nestjs/common';
import { dbRepository } from '@businessos/database';
import { Customer, Lead } from '@businessos/shared';

@Injectable()
export class CustomersService {
  async getCustomers(organizationId: string) {
    return dbRepository.getCustomers(organizationId);
  }

  async createCustomer(organizationId: string, data: Partial<Customer>) {
    return dbRepository.addCustomer(organizationId, data);
  }

  async getLeads(organizationId: string) {
    return dbRepository.getLeads(organizationId);
  }

  async updateLeadStage(organizationId: string, leadId: string, stage: any) {
    const lead = dbRepository.updateLeadStage(organizationId, leadId, stage);
    if (!lead) throw new NotFoundException(`Lead with ID ${leadId} not found`);
    return lead;
  }
}
