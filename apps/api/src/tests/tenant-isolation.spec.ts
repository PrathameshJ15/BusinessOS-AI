import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dbRepository } from '@businessos/database';
import { hasPermission, authorizeAction, ROLE_PERMISSIONS } from '@businessos/auth';

describe('Multi-Tenant Isolation & Security Tests', () => {
  const orgAId = 'org-lumina-101';
  const orgBId = 'org-competitor-999';

  it('should isolate customer records between Organization A and Organization B', () => {
    const orgACustomers = dbRepository.getCustomers(orgAId);
    const orgBCustomers = dbRepository.getCustomers(orgBId);

    assert.strictEqual(orgACustomers.every((c) => c.organizationId === orgAId), true);
    assert.strictEqual(orgBCustomers.every((c) => c.organizationId === orgBId), true);
    assert.strictEqual(orgBCustomers.length, 0);
  });

  it('should prevent Organization B from accessing Organization A bookings', () => {
    const orgABookings = dbRepository.getBookings(orgAId);
    const orgBBookings = dbRepository.getBookings(orgBId);

    assert.strictEqual(orgABookings.every((b) => b.organizationId === orgAId), true);
    assert.strictEqual(orgBBookings.length, 0);
  });

  it('should prevent Organization B from accessing Organization A website builder data', () => {
    const orgAWebsite = dbRepository.getWebsite(orgAId);
    const orgBWebsite = dbRepository.getWebsite(orgBId);

    assert.strictEqual(orgAWebsite?.organizationId, orgAId);
    assert.strictEqual(orgBWebsite, null);
  });

  it('should prevent Organization B from accessing Organization A campaigns and invoices', () => {
    const orgACampaigns = dbRepository.getCampaigns(orgAId);
    const orgBCampaigns = dbRepository.getCampaigns(orgBId);
    assert.strictEqual(orgACampaigns.every((c) => c.organizationId === orgAId), true);
    assert.strictEqual(orgBCampaigns.length, 0);

    const orgAInvoices = dbRepository.getInvoices(orgAId);
    const orgBInvoices = dbRepository.getInvoices(orgBId);
    assert.strictEqual(orgAInvoices.every((i) => i.organizationId === orgAId), true);
    assert.strictEqual(orgBInvoices.length, 0);
  });

  it('should enforce strict RBAC permissions across roles', () => {
    // OWNER should have full write scopes
    assert.strictEqual(hasPermission('OWNER', 'customers:write'), true);
    assert.strictEqual(hasPermission('OWNER', 'marketing:write'), true);
    assert.strictEqual(hasPermission('OWNER', 'settings:write'), true);
    assert.strictEqual(hasPermission('OWNER', 'org:billing'), true);

    // MANAGER should have operational write scopes but not billing
    assert.strictEqual(hasPermission('MANAGER', 'customers:write'), true);
    assert.strictEqual(hasPermission('MANAGER', 'marketing:write'), true);
    assert.strictEqual(hasPermission('MANAGER', 'settings:write'), false);
    assert.strictEqual(hasPermission('MANAGER', 'org:billing'), false);

    // STAFF should have read scopes only and be blocked from sensitive writes
    assert.strictEqual(hasPermission('STAFF', 'customers:read'), true);
    assert.strictEqual(hasPermission('STAFF', 'bookings:read'), true);
    assert.strictEqual(hasPermission('STAFF', 'customers:write'), false);
    assert.strictEqual(hasPermission('STAFF', 'marketing:write'), false);
    assert.strictEqual(hasPermission('STAFF', 'settings:write'), false);
  });

  it('should correctly authorize or deny action based on active session', () => {
    const ownerSession = {
      userId: 'usr-1',
      userName: 'Owner User',
      userEmail: 'owner@test.com',
      organizationId: orgAId,
      organizationName: 'Org A',
      role: 'OWNER' as const,
    };

    const staffSession = {
      userId: 'usr-2',
      userName: 'Staff User',
      userEmail: 'staff@test.com',
      organizationId: orgAId,
      organizationName: 'Org A',
      role: 'STAFF' as const,
    };

    assert.strictEqual(authorizeAction(ownerSession, 'marketing:write').authorized, true);
    const staffAuth = authorizeAction(staffSession, 'marketing:write');
    assert.strictEqual(staffAuth.authorized, false);
    assert.ok(staffAuth.reason?.includes('Access denied'));
  });
});
