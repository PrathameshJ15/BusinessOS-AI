import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Campaign } from '@businessos/shared';

@ApiTags('Marketing & Broadcasts')
@Controller('marketing')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('campaigns')
  @RequirePermission('marketing:read')
  @ApiOperation({ summary: 'Get all broadcast campaigns' })
  async getCampaigns(@CurrentUser('organizationId') organizationId: string) {
    return this.marketingService.getCampaigns(organizationId);
  }

  @Post('campaigns')
  @RequirePermission('marketing:write')
  @ApiOperation({ summary: 'Create and dispatch multi-channel broadcast campaign' })
  async createCampaign(
    @CurrentUser('organizationId') organizationId: string,
    @Body() campaignData: Partial<Campaign>,
  ) {
    return this.marketingService.createCampaign(organizationId, campaignData);
  }

  @Get('reviews')
  @RequirePermission('marketing:read')
  @ApiOperation({ summary: 'Get Google Business reviews' })
  async getReviews(@CurrentUser('organizationId') organizationId: string) {
    return this.marketingService.getReviews(organizationId);
  }

  @Post('reviews/:id/reply')
  @RequirePermission('marketing:write')
  @ApiOperation({ summary: 'Post AI or manual response to customer review' })
  async replyToReview(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') reviewId: string,
    @Body() body: { responseText: string },
  ) {
    return this.marketingService.replyToReview(organizationId, reviewId, body.responseText);
  }
}
