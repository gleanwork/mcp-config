import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CLIENT, CLIENT_IDS, DISPLAY_NAME_BY_ID, allClientConfigs } from '../src/clients.generated';
import { CLIENT_TYPES, getDisplayName } from '../src/constants';
import { MCPConfigRegistry } from '../src/registry';

/**
 * Guards the single-source-of-truth invariant: configs/*.json is authoritative,
 * and src/clients.generated.ts is derived from it via `npm run generate:clients`.
 * If these fail, the generated file is stale — regenerate it.
 */
describe('clients.generated.ts stays in sync with configs/', () => {
  const configsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'configs');
  const configFiles = readdirSync(configsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const configs = configFiles.map((file) => ({
    file,
    base: file.replace(/\.json$/, ''),
    ...(JSON.parse(readFileSync(join(configsDir, file), 'utf8')) as {
      id: string;
      displayName: string;
    }),
  }));

  it('every config filename matches its id', () => {
    for (const c of configs) {
      expect(c.id, `${c.file} id`).toBe(c.base);
    }
  });

  it('CLIENT_IDS covers exactly the config files', () => {
    expect([...CLIENT_IDS].sort()).toEqual(configs.map((c) => c.id).sort());
  });

  it('allClientConfigs has one entry per config file', () => {
    expect(allClientConfigs).toHaveLength(configs.length);
    const registry = new MCPConfigRegistry();
    expect(registry.getAllConfigs()).toHaveLength(configs.length);
  });

  it('CLIENT, display names, and getDisplayName derive from each config', () => {
    const clientValues = Object.values(CLIENT) as string[];
    for (const c of configs) {
      expect(clientValues, `CLIENT missing ${c.id}`).toContain(c.id);
      expect(DISPLAY_NAME_BY_ID[c.id as keyof typeof DISPLAY_NAME_BY_ID]).toBe(c.displayName);
      expect(getDisplayName(c.id as (typeof CLIENT)[keyof typeof CLIENT])).toBe(c.displayName);
    }
  });

  it('every config declares a non-empty types array of known client types', () => {
    const registry = new MCPConfigRegistry();
    const known = new Set<string>(CLIENT_TYPES);
    for (const c of configs) {
      const cfg = registry.getConfig(c.id as (typeof CLIENT_IDS)[number]);
      expect(cfg, `registry missing ${c.id}`).toBeDefined();
      expect(Array.isArray(cfg!.types) && cfg!.types.length > 0, `${c.id} types non-empty`).toBe(
        true
      );
      for (const t of cfg!.types) {
        expect(known.has(t), `${c.id} has unknown type "${t}"`).toBe(true);
      }
    }
  });
});
