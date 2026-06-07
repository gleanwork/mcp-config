import { describe, it, expect } from 'vitest';
import { CLIENT_TYPES, TYPE_LABELS } from '../src/constants';
import { ClientTypeSchema } from '../src/schemas';

/**
 * Guards the small public surface added for client types: the vocabulary
 * (CLIENT_TYPES), its labels (TYPE_LABELS), and the Zod enum derived from it.
 */
describe('client types vocabulary', () => {
  it('CLIENT_TYPES is the expected set', () => {
    expect([...CLIENT_TYPES]).toEqual(['cli', 'desktop', 'ide', 'web']);
  });

  it('TYPE_LABELS has a non-empty label for exactly every client type', () => {
    expect(Object.keys(TYPE_LABELS).sort()).toEqual([...CLIENT_TYPES].sort());
    for (const t of CLIENT_TYPES) {
      expect(typeof TYPE_LABELS[t]).toBe('string');
      expect(TYPE_LABELS[t].length).toBeGreaterThan(0);
    }
  });

  it('ClientTypeSchema enum is derived from CLIENT_TYPES (no drift)', () => {
    expect(ClientTypeSchema.options).toEqual([...CLIENT_TYPES]);
  });

  it('ClientTypeSchema accepts valid types and rejects unknown ones', () => {
    for (const t of CLIENT_TYPES) {
      expect(ClientTypeSchema.safeParse(t).success).toBe(true);
    }
    expect(ClientTypeSchema.safeParse('mobile').success).toBe(false);
  });
});
