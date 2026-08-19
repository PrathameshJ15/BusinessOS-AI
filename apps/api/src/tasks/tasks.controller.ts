import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Operational Tasks')
@Controller('tasks')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermission('org:read')
  @ApiOperation({ summary: 'Get all pending tasks' })
  async getTasks(@CurrentUser('organizationId') organizationId: string) {
    return this.tasksService.getTasks(organizationId);
  }

  @Patch(':id/toggle')
  @RequirePermission('org:write')
  @ApiOperation({ summary: 'Toggle task completion status' })
  async toggleTaskStatus(@Param('id') taskId: string) {
    return this.tasksService.toggleTaskStatus(taskId);
  }
}
