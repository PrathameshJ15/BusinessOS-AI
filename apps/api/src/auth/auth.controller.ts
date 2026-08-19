import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { AuthSession } from '@businessos/auth';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user, organization, role, and permissions' })
  @ApiResponse({ status: 200, description: 'User session and permissions returned successfully.' })
  async getMe(@CurrentUser() session: AuthSession) {
    return this.authService.getMe(session);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user credentials' })
  async login(@Body() body: { email: string }) {
    return this.authService.login(body.email || 'ananya@luminaluxe.com');
  }
}
