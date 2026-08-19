import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '@businessos/shared';
import { AuthSession, hasPermission } from '@businessos/auth';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session: AuthSession = request.user;

    if (!session) {
      throw new ForbiddenException('User context missing for RBAC evaluation.');
    }

    const hasAccess = requiredPermissions.every((perm) => hasPermission(session.role, perm));
    if (!hasAccess) {
      throw new ForbiddenException(`Role '${session.role}' lacks required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
