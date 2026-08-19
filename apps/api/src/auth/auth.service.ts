import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthSession, ROLE_PERMISSIONS } from '@businessos/auth';
import { dbRepository } from '@businessos/database';

@Injectable()
export class AuthService {
  async getMe(session: AuthSession) {
    const org = dbRepository.getOrganization(session.organizationId);
    const profile = dbRepository.getBusinessProfile(session.organizationId);

    return {
      user: {
        id: session.userId,
        name: session.userName,
        email: session.userEmail,
      },
      organization: {
        id: session.organizationId,
        name: session.organizationName,
        plan: org?.plan || 'PRO',
        currency: org?.currency || 'INR',
        timezone: org?.timezone || 'Asia/Kolkata',
      },
      profile,
      role: session.role,
      permissions: ROLE_PERMISSIONS[session.role] || [],
    };
  }

  async login(email: string) {
    return {
      token: 'jwt_mock_token_lumina_luxe_spa',
      session: {
        userId: 'usr-1',
        userName: 'Ananya Verma',
        userEmail: email,
        organizationId: 'org-lumina-101',
        organizationName: 'Lumina Luxe Spa & Salon',
        role: 'OWNER',
      },
    };
  }
}
