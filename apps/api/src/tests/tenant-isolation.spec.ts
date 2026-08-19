import { BusinessOSApiEngine } from '../main';
import { dbRepository } from '@businessos/database';

describe('Multi-Tenant Isolation & Security Tests', () => {
  const orgAId = 'org-lumina-101';
  const orgBId = 'org-competitor-999';

  it('should isolate customer records between Organization A and Organization B', () => {
    const orgACustomers = dbRepository.getCustomers(orgAId);
    const orgBCustomers = dbRepository.getCustomers(orgBId);

    expect(orgACustomers.every((c) => c.organizationId === orgAId)).toBe(true);
    expect(orgBCustomers.every((c) => c.organizationId === orgBId)).toBe(true);
    expect(orgBCustomers.length).toBe(0);
  });

  it('should prevent Organization B from accessing Organization A bookings', () => {
    const orgABookings = dbRepository.getBookings(orgAId);
    const orgBBookings = dbRepository.getBookings(orgBId);

    expect(orgABookings.every((b) => b.organizationId === orgAId)).toBe(true);
    expect(orgBBookings.length).toBe(0);
  });

  it('should prevent Organization B from accessing Organization A website builder data', () => {
    const orgAWebsite = dbRepository.getWebsite(orgAId);
    const orgBWebsite = dbRepository.getWebsite(orgBId);

    expect(orgAWebsite?.organizationId).toBe(orgAId);
    expect(orgBWebsite).toBeNull();
  });
});
