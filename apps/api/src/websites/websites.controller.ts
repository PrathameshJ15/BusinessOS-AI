import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebsitesService } from './websites.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Website Builder & Funnels')
@Controller('websites')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Get()
  @RequirePermission('website:read')
  @ApiOperation({ summary: 'Get organization website structure and block content' })
  async getWebsite(@CurrentUser('organizationId') organizationId: string) {
    return this.websitesService.getWebsite(organizationId);
  }

  @Patch('blocks/:blockId')
  @RequirePermission('website:write')
  @ApiOperation({ summary: 'Update a specific layout block content' })
  async updateWebsiteBlock(
    @CurrentUser('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() body: { content: any },
  ) {
    return this.websitesService.updateWebsiteBlock(organizationId, blockId, body.content);
  }

  @Post('publish')
  @RequirePermission('website:write')
  @ApiOperation({ summary: 'Toggle website live publishing status' })
  async togglePublish(@CurrentUser('organizationId') organizationId: string) {
    return this.websitesService.togglePublish(organizationId);
  }
}
