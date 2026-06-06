import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CLIENT_ICONS } from '../src/icons.generated';
import { getClientIcon } from '../src/icons';
import { MCPConfigRegistry } from '../src/registry';

/**
 * Icons are optional per client. These guard that the generated manifest stays
 * in sync with the raw icons/ files and that no icon references a missing
 * client config. Regenerate with `npm run generate:icons`.
 */
describe('client icons', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const configIds = new Set(
    readdirSync(join(root, 'configs'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
  );
  const iconFileIds = readdirSync(join(root, 'icons'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''))
    .sort();

  it('manifest matches the raw icon files exactly', () => {
    expect(Object.keys(CLIENT_ICONS).sort()).toEqual(iconFileIds);
  });

  it('every icon maps to a real client config (no orphans)', () => {
    for (const id of Object.keys(CLIENT_ICONS)) {
      expect(configIds.has(id), `${id} has no matching config`).toBe(true);
    }
  });

  it('every entry is non-empty SVG markup with the expected file name and title', () => {
    for (const [id, icon] of Object.entries(CLIENT_ICONS)) {
      expect(icon.svg.startsWith('<svg'), `${id} svg`).toBe(true);
      expect(icon.fileName).toBe(`${id}.svg`);
      expect(icon.title, `${id} title`).toBeTruthy();
    }
  });

  it('getClientIcon returns markup when present and undefined when absent', () => {
    const registry = new MCPConfigRegistry();
    for (const c of registry.getAllConfigs()) {
      const icon = getClientIcon(c.id);
      if ((CLIENT_ICONS as Record<string, unknown>)[c.id]) {
        expect(icon?.startsWith('<svg'), c.id).toBe(true);
      } else {
        expect(icon, c.id).toBeUndefined();
      }
    }
  });
});
