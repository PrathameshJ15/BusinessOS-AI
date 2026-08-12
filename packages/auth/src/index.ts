import { Permission, Role } from '@businessos/shared';

export interface AuthSession {
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  role: Role;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'org:read',
    'org:write',
    'org:billing',
    'customers:read',
    'customers:write',
    'customers:delete',
    'bookings:read',
    'bookings:write',
    'bookings:delete',
    'marketing:read',
    'marketing:write',
    'website:read',
    'website:write',
    'ai:execute',
    'settings:read',
    'settings:write',
  ],
  MANAGER: [
    'org:read',
    'customers:read',
    'customers:write',
    'bookings:read',
    'bookings:write',
    'marketing:read',
    'marketing:write',
    'website:read',
    'website:write',
    'ai:execute',
    'settings:read',
  ],
  STAFF: [
    'org:read',
    'customers:read',
    'bookings:read',
    'bookings:write',
    'settings:read',
  ],
};

export function hasPermission(role: Role, requiredPermission: Permission): boolean {
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];
  return allowedPermissions.includes(requiredPermission);
}

export function authorizeAction(
  session: AuthSession,
  requiredPermission: Permission
): { authorized: boolean; reason?: string } {
  if (!hasPermission(session.role, requiredPermission)) {
    return {
      authorized: false,
      reason: `Access denied. Role '${session.role}' lacks required permission '${requiredPermission}'.`,
    };
  }
  return { authorized: true };
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  verdict: 'ALLOWED' | 'DENIED';
  metadata?: Record<string, any>;
}

export const auditLogsStore: SecurityAuditLog[] = [];

export function logSecurityAudit(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>): SecurityAuditLog {
  const entry: SecurityAuditLog = {
    id: `audit-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  auditLogsStore.push(entry);
  return entry;
}
