import { Injectable, NotFoundException } from '@nestjs/common';
import { dbRepository } from '@businessos/database';

@Injectable()
export class WebsitesService {
  async getWebsite(organizationId: string) {
    return dbRepository.getWebsite(organizationId);
  }

  async updateWebsiteBlock(organizationId: string, blockId: string, content: any) {
    const website = dbRepository.updateWebsiteBlock(organizationId, blockId, content);
    if (!website) throw new NotFoundException(`Website block with ID ${blockId} not found`);
    return website;
  }

  async togglePublish(organizationId: string) {
    return dbRepository.publishWebsiteToggle(organizationId);
  }
}
