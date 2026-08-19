import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthSession } from '@businessos/auth';
import { AIProvider } from '@businessos/ai';

@ApiTags('Saarthi AI Engine')
@Controller('ai')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('messages')
  @RequirePermission('ai:execute')
  @ApiOperation({ summary: 'Process natural language user command via AI provider & tool registry' })
  async processMessage(
    @CurrentUser() session: AuthSession,
    @Body() body: { prompt: string; provider?: AIProvider },
  ) {
    return this.aiService.processUserCommand(session, body.prompt, body.provider || 'openai');
  }
}
