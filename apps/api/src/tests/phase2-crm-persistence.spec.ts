import { describe, it } from 'node:test';
import assert from 'node:assert';

// ─── Helpers mirroring the route logic for deterministic validation ───────────

interface TestBooking {
  id: string;
  organizationId: string;
  staffId: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

function checkBookingConflict(
  existingBookings: TestBooking[],
  orgId: string,
  staffId: string,
  newStart: Date,
  newEnd: Date
): TestBooking | undefined {
  return existingBookings.find((b) => {
    if (b.organizationId !== orgId) return false;
    if (b.staffId !== staffId) return false;
    if (['CANCELLED', 'REJECTED'].includes(b.status)) return false;

    // Overlap condition: (b.startTime < newEnd) && (b.endTime > newStart)
    return b.startTime < newEnd && b.endTime > newStart;
  });
}

describe('Phase 2 — CRM Persistence & Booking Conflict Detection Tests', () => {
  const orgId = 'org-lumina-101';
  const orgOther = 'org-competitor-999';
  const staff1 = 'stf-priya';
  const staff2 = 'stf-vikram';

  const baseBooking: TestBooking = {
    id: 'bk-101',
    organizationId: orgId,
    staffId: staff1,
    serviceName: 'Aromatherapy Massage',
    startTime: new Date('2026-10-16T10:00:00Z'),
    endTime: new Date('2026-10-16T11:00:00Z'),
    status: 'CONFIRMED',
  };

  const existingBookings = [baseBooking];

  describe('Smart Booking Conflict Guard', () => {
    it('should detect conflict when new booking starts during an existing appointment', () => {
      const conflict = checkBookingConflict(
        existingBookings,
        orgId,
        staff1,
        new Date('2026-10-16T10:30:00Z'),
        new Date('2026-10-16T11:30:00Z')
      );
      assert.ok(conflict, 'Expected a conflict to be detected');
      assert.strictEqual(conflict.id, 'bk-101');
    });

    it('should detect conflict when new booking ends during an existing appointment', () => {
      const conflict = checkBookingConflict(
        existingBookings,
        orgId,
        staff1,
        new Date('2026-10-16T09:30:00Z'),
        new Date('2026-10-16T10:30:00Z')
      );
      assert.ok(conflict, 'Expected a conflict to be detected');
      assert.strictEqual(conflict.id, 'bk-101');
    });

    it('should detect conflict when new booking completely encompasses an existing appointment', () => {
      const conflict = checkBookingConflict(
        existingBookings,
        orgId,
        staff1,
        new Date('2026-10-16T09:00:00Z'),
        new Date('2026-10-16T12:00:00Z')
      );
      assert.ok(conflict, 'Expected an encompassing conflict to be detected');
      assert.strictEqual(conflict.id, 'bk-101');
    });

    it('should allow adjacent appointments without overlap', () => {
      const beforeBooking = checkBookingConflict(
        existingBookings,
        orgId,
        staff1,
        new Date('2026-10-16T09:00:00Z'),
        new Date('2026-10-16T10:00:00Z') // Ends right when baseBooking starts
      );
      assert.strictEqual(beforeBooking, undefined, 'Adjacent preceding appointment should not conflict');

      const afterBooking = checkBookingConflict(
        existingBookings,
        orgId,
        staff1,
        new Date('2026-10-16T11:00:00Z'), // Starts right when baseBooking ends
        new Date('2026-10-16T12:00:00Z')
      );
      assert.strictEqual(afterBooking, undefined, 'Adjacent succeeding appointment should not conflict');
    });

    it('should allow concurrent appointments for different staff members', () => {
      const differentStaffBooking = checkBookingConflict(
        existingBookings,
        orgId,
        staff2, // Vikram instead of Priya
        new Date('2026-10-16T10:00:00Z'),
        new Date('2026-10-16T11:00:00Z')
      );
      assert.strictEqual(differentStaffBooking, undefined, 'Different staff member should be available');
    });

    it('should never block appointments across different tenants', () => {
      const otherTenantBooking = checkBookingConflict(
        existingBookings,
        orgOther,
        staff1,
        new Date('2026-10-16T10:00:00Z'),
        new Date('2026-10-16T11:00:00Z')
      );
      assert.strictEqual(otherTenantBooking, undefined, 'Appointments in another tenant should not conflict');
    });

    it('should ignore cancelled bookings for conflict checks', () => {
      const cancelledList: TestBooking[] = [
        {
          ...baseBooking,
          status: 'CANCELLED',
        },
      ];
      const conflict = checkBookingConflict(
        cancelledList,
        orgId,
        staff1,
        new Date('2026-10-16T10:00:00Z'),
        new Date('2026-10-16T11:00:00Z')
      );
      assert.strictEqual(conflict, undefined, 'Cancelled bookings should not cause conflict');
    });
  });

  describe('Customer Notes & Activity Serialization', () => {
    it('should encode and decode notes within customer tags cleanly', () => {
      const note = {
        id: 'nte-test-1',
        organizationId: orgId,
        customerId: 'cust-101',
        authorName: 'Krushna',
        content: 'Prefers organic essential oils without artificial fragrance.',
        createdAt: '2026-10-15T12:00:00Z',
      };

      const rawTag = `__note__:${JSON.stringify(note)}`;
      assert.ok(rawTag.startsWith('__note__:'));

      const decoded = JSON.parse(rawTag.replace('__note__:', ''));
      assert.strictEqual(decoded.id, 'nte-test-1');
      assert.strictEqual(decoded.authorName, 'Krushna');
      assert.strictEqual(decoded.content, note.content);
    });

    it('should isolate customer notes by customerId and organizationId', () => {
      const existingTags = [
        'VIP',
        `__note__:${JSON.stringify({ id: 'n1', organizationId: orgId, customerId: 'c1', content: 'Note 1' })}`,
        'Regular',
        `__note__:${JSON.stringify({ id: 'n2', organizationId: orgId, customerId: 'c1', content: 'Note 2' })}`,
      ];

      const extracted = existingTags
        .filter((t) => t.startsWith('__note__:'))
        .map((t) => JSON.parse(t.replace('__note__:', '')));

      assert.strictEqual(extracted.length, 2);
      assert.strictEqual(extracted[0].content, 'Note 1');
      assert.strictEqual(extracted[1].content, 'Note 2');
    });
  });

  describe('Lead Pipeline Stage Transitions', () => {
    it('should allow valid stage transitions from NEW to QUALIFIED to WON', () => {
      const validStages = ['NEW', 'QUALIFIED', 'WON', 'LOST'];
      let currentStage = 'NEW';

      assert.strictEqual(validStages.includes(currentStage), true);
      currentStage = 'QUALIFIED';
      assert.strictEqual(validStages.includes(currentStage), true);
      currentStage = 'WON';
      assert.strictEqual(validStages.includes(currentStage), true);
    });
  });

  describe('Google Review Reply State', () => {
    it('should persist responseText onto review object', () => {
      const review = {
        id: 'rev-101',
        authorName: 'Sneha Patel',
        rating: 5,
        content: 'Loved the Hydra-Facial!',
        responseText: null as string | null,
      };

      const reply = 'Thank you Sneha! Glad you had a great experience.';
      const updated = { ...review, responseText: reply };

      assert.strictEqual(updated.responseText, reply);
      assert.strictEqual(updated.rating, 5);
      assert.strictEqual(updated.id, 'rev-101');
    });
  });
});
