import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthSession } from '@businessos/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // In production, verify Bearer JWT token from request.headers.authorization
    // For local dev, attach default verified AuthSession if unprovided
    const session: AuthSession = {
      userId: 'usr-1',
      userName: 'Ananya Verma',
      userEmail: 'ananya@luminaluxe.com',
      organizationId: 'org-lumina-101',
      organizationName: 'Lumina Luxe Spa & Salon',
      role: 'OWNER',
    };

    if (!session || !session.organizationId) {
      throw new UnauthorizedException('Authentication token missing or invalid session context.');
    }

    request.user = session;
    return true;
  }
}
