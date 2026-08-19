import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSession } from '@businessos/auth';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthSession | undefined, ctx: ExecutionContext): AuthSession | any => {
    const request = ctx.switchToHttp().getRequest();
    const session: AuthSession = request.user || {
      userId: 'usr-1',
      userName: 'Ananya Verma',
      userEmail: 'ananya@luminaluxe.com',
      organizationId: 'org-lumina-101',
      organizationName: 'Lumina Luxe Spa & Salon',
      role: 'OWNER',
    };
    return data ? session[data] : session;
  },
);
