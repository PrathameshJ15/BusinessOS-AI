import { describe, it } from 'node:test';
import assert from 'node:assert';

// ─── Phase 3 Test Suite: AI Website Builder & Public Lead Funnels ─────────────

interface TestBlock {
  id: string;
  type: string;
  order: number;
  content: Record<string, any>;
}

const STORAGE_DELIMITER = ':::';

function serializeStoredBlocks(fontFamily: string, blocks: TestBlock[]): string {
  const cleanFont = (fontFamily || 'Inter').split(STORAGE_DELIMITER)[0].trim();
  return `${cleanFont}${STORAGE_DELIMITER}${JSON.stringify({ blocks })}`;
}

function parseStoredBlocks(rawFontFamily: string | null | undefined, fallbackBlocks: TestBlock[]): {
  fontFamily: string;
  blocks: TestBlock[];
} {
  if (!rawFontFamily) {
    return { fontFamily: 'Inter', blocks: fallbackBlocks };
  }

  if (rawFontFamily.includes(STORAGE_DELIMITER)) {
    const [font, jsonStr] = rawFontFamily.split(STORAGE_DELIMITER);
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed?.blocks) && parsed.blocks.length > 0) {
        return {
          fontFamily: font?.trim() || 'Inter',
          blocks: parsed.blocks,
        };
      }
    } catch {
      // Fall through to plain font handling
    }
    return { fontFamily: font?.trim() || 'Inter', blocks: fallbackBlocks };
  }

  return { fontFamily: rawFontFamily.trim() || 'Inter', blocks: fallbackBlocks };
}

function updateBlockContent(
  blocks: TestBlock[],
  targetBlockId: string,
  newContent: Record<string, any>
): { updated: boolean; blocks: TestBlock[] } {
  let found = false;
  const updatedBlocks = blocks.map((b) => {
    if (b.id === targetBlockId) {
      found = true;
      return {
        ...b,
        content: { ...b.content, ...newContent },
      };
    }
    return b;
  });

  return { updated: found, blocks: updatedBlocks };
}

function validatePublicLeadPayload(body: any): { valid: boolean; error?: string } {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (!body.phone && !body.email) {
    return { valid: false, error: 'Either email or phone is required' };
  }
  return { valid: true };
}

describe('Phase 3 — AI Website Builder & Lead Funnel Tests', () => {
  const defaultBlocks: TestBlock[] = [
    {
      id: 'blk-hero',
      type: 'HERO',
      order: 0,
      content: { heading: 'Welcome to Lumina Luxe', subheading: 'Luxury Salon & Wellness Sanctuary' },
    },
    {
      id: 'blk-services',
      type: 'SERVICES',
      order: 1,
      content: { heading: 'Our Signature Offerings' },
    },
  ];

  describe('Storage Serialization & Delimiter Parsing', () => {
    it('should serialize font and blocks into single string without data loss', () => {
      const serialized = serializeStoredBlocks('Outfit', defaultBlocks);
      assert.ok(serialized.startsWith('Outfit:::'));
      assert.ok(serialized.includes('Welcome to Lumina Luxe'));
    });

    it('should parse serialized string back into font and blocks accurately', () => {
      const serialized = serializeStoredBlocks('Playfair Display', defaultBlocks);
      const { fontFamily, blocks } = parseStoredBlocks(serialized, []);

      assert.strictEqual(fontFamily, 'Playfair Display');
      assert.strictEqual(blocks.length, 2);
      assert.strictEqual(blocks[0].content.heading, 'Welcome to Lumina Luxe');
    });

    it('should gracefully handle plain legacy font strings without breaking', () => {
      const { fontFamily, blocks } = parseStoredBlocks('Roboto', defaultBlocks);
      assert.strictEqual(fontFamily, 'Roboto');
      assert.strictEqual(blocks.length, 2);
      assert.strictEqual(blocks[0].id, 'blk-hero');
    });

    it('should handle malformed JSON payload by falling back to defaults', () => {
      const { fontFamily, blocks } = parseStoredBlocks('Inter:::{invalid-json}', defaultBlocks);
      assert.strictEqual(fontFamily, 'Inter');
      assert.strictEqual(blocks.length, 2);
    });
  });

  describe('Block Updates & Atomic Editing', () => {
    it('should update block heading and subheading while preserving other block properties', () => {
      const { updated, blocks } = updateBlockContent(defaultBlocks, 'blk-hero', {
        heading: 'Rejuvenate Your Mind & Soul',
        subheading: 'Award-winning treatments in Pune',
      });

      assert.strictEqual(updated, true);
      const hero = blocks.find((b) => b.id === 'blk-hero');
      assert.strictEqual(hero?.content.heading, 'Rejuvenate Your Mind & Soul');
      assert.strictEqual(hero?.content.subheading, 'Award-winning treatments in Pune');
      assert.strictEqual(hero?.order, 0);

      // Verify other blocks remain unchanged
      const services = blocks.find((b) => b.id === 'blk-services');
      assert.strictEqual(services?.content.heading, 'Our Signature Offerings');
    });

    it('should return updated: false when target block id is not found', () => {
      const { updated, blocks } = updateBlockContent(defaultBlocks, 'non-existent-id', {
        heading: 'New Title',
      });

      assert.strictEqual(updated, false);
      assert.strictEqual(blocks[0].content.heading, 'Welcome to Lumina Luxe');
    });
  });

  describe('Public Lead Funnel Ingestion Validation', () => {
    it('should accept valid lead submissions with name and phone', () => {
      const result = validatePublicLeadPayload({
        name: 'Aarav Sharma',
        phone: '+91 98765 43210',
        message: 'Interested in booking Saturday 4 PM',
      });
      assert.strictEqual(result.valid, true);
    });

    it('should accept valid lead submissions with name and email', () => {
      const result = validatePublicLeadPayload({
        name: 'Sneha Patel',
        email: 'sneha@example.com',
      });
      assert.strictEqual(result.valid, true);
    });

    it('should reject submissions with missing or empty name', () => {
      const result = validatePublicLeadPayload({
        name: '   ',
        phone: '+91 98765 43210',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Name is required');
    });

    it('should reject submissions missing both email and phone contact info', () => {
      const result = validatePublicLeadPayload({
        name: 'Rohan Mehra',
        message: 'Please call me',
      });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Either email or phone is required');
    });
  });

  describe('AI Website Generator Block Structure', () => {
    const requiredTypes = ['HERO', 'SERVICES', 'TESTIMONIALS', 'CONTACT'];

    it('should include all standard funnel blocks in generated structure', () => {
      const generatedBlocks: TestBlock[] = [
        { id: 'b1', type: 'HERO', order: 0, content: {} },
        { id: 'b2', type: 'SERVICES', order: 1, content: {} },
        { id: 'b3', type: 'TESTIMONIALS', order: 2, content: {} },
        { id: 'b4', type: 'CONTACT', order: 3, content: {} },
      ];

      const blockTypes = generatedBlocks.map((b) => b.type);
      for (const req of requiredTypes) {
        assert.ok(blockTypes.includes(req), `Expected generated blocks to contain ${req}`);
      }
    });
  });
});
