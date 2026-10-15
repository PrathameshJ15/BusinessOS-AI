import { WebsiteBlock } from '@businessos/shared';
import { mockWebsite } from '@businessos/database';

export const STORAGE_DELIMITER = ':::';

export function parseStoredBlocks(fontFamily: string | null | undefined): WebsiteBlock[] {
  if (fontFamily && fontFamily.includes(STORAGE_DELIMITER)) {
    try {
      const parts = fontFamily.split(STORAGE_DELIMITER);
      const payload = JSON.parse(parts.slice(1).join(STORAGE_DELIMITER));
      if (Array.isArray(payload.blocks) && payload.blocks.length > 0) {
        return payload.blocks;
      }
    } catch (e) {
      console.warn('[website-storage] Failed to parse stored blocks JSON:', e);
    }
  }
  return mockWebsite.pages[0].blocks;
}

export function serializeStoredBlocks(baseFont: string | null | undefined, blocks: WebsiteBlock[]): string {
  const cleanFont = (baseFont || 'Inter').split(STORAGE_DELIMITER)[0].trim();
  return `${cleanFont}${STORAGE_DELIMITER}${JSON.stringify({ blocks })}`;
}
