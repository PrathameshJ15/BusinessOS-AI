export interface MockAuthUser {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  avatarUrl: string;
  badge: string;
  roleBadgeColor: string;
  description: string;
  permissionsSummary: string;
}

export const MOCK_AUTH_USERS: MockAuthUser[] = [
  {
    id: 'usr-owner-1',
    username: 'owner',
    email: 'owner@businessos.com',
    password: 'Password@123',
    name: 'Prathamesh Jadhav',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    badge: 'Owner & Executive',
    roleBadgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Full workspace control, billing, revenue analytics & system config',
    permissionsSummary: 'All Permissions • Billing & Team Control',
  },
  {
    id: 'usr-manager-2',
    username: 'manager',
    email: 'manager@businessos.com',
    password: 'Manager@123',
    name: 'Krushna Sharma',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    badge: 'Operations Manager',
    roleBadgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Staff scheduling, customer CRM, marketing campaigns & automations',
    permissionsSummary: 'CRM, Staff Management, Marketing & Sales',
  },
  {
    id: 'usr-staff-3',
    username: 'staff',
    email: 'staff@businessos.com',
    password: 'Staff@123',
    name: 'Priya Patel',
    role: 'STAFF',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badge: 'Front-Desk & Staff',
    roleBadgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Client appointments, services check-in, bookings & point of sale',
    permissionsSummary: 'Bookings, Check-in, Client Records & POS',
  },
  {
    id: 'usr-admin-4',
    username: 'admin',
    email: 'admin@businessos.com',
    password: 'Admin@123',
    name: 'Aditi Rao',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    badge: 'System Administrator',
    roleBadgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Platform administrator, security settings & organization oversight',
    permissionsSummary: 'Multi-Tenant Admin • Security & Audit Access',
  },
  // Legacy / Quick Test Aliases
  {
    id: 'usr-prathamesh',
    username: 'prathamesh',
    email: 'prathamesh@test.com',
    password: 'Password@123',
    name: 'Prathamesh Jadhav',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    badge: 'Workspace Owner',
    roleBadgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Quick test demo owner account',
    permissionsSummary: 'All Permissions (Test Alias)',
  },
  {
    id: 'usr-krushna',
    username: 'krushna',
    email: 'krushna@test.com',
    password: 'Manager@123',
    name: 'Krushna',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    badge: 'Workspace Manager',
    roleBadgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Quick test demo manager account',
    permissionsSummary: 'CRM & Staff Operations (Test Alias)',
  },
];

/**
 * Filter primary display users for UI cards (excluding aliases)
 */
export const PRIMARY_MOCK_USERS = MOCK_AUTH_USERS.slice(0, 4);
