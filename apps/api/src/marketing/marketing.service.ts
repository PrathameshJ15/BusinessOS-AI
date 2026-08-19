import { Injectable, NotFoundException } from '@nestjs/common';
import { dbRepository } from '@businessos/database';
import { Campaign } from '@businessos/shared';

@Injectable()
export class MarketingService {
  async getCampaigns(organizationId: string) {
    return dbRepository.getCampaigns(organizationId);
  }

  async createCampaign(organizationId: string, campaignData: Partial<Campaign>) {
    return dbRepository.addCampaign(organizationId, campaignData);
  }

  async getReviews(organizationId: string) {
    return dbRepository.getReviews(organizationId);
  }

  async replyToReview(organizationId: string, reviewId: string, responseText: string) {
    const review = dbRepository.replyToReview(organizationId, reviewId, responseText);
    if (!review) throw new NotFoundException(`Review with ID ${reviewId} not found`);
    return review;
  }
}
