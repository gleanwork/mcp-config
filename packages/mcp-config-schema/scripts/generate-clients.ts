/**
 * Generate src/clients.generated.ts from the configs/*.json files.
 *
 * The config files are the single source of truth for client identity. This
 * script derives the constants, the client-id tuple (for the Zod enum), and the
 * config import list so those never have to be hand-maintained in lockstep.
 *
 * Run via `npm run generate:clients`. The output is committed and guarded by a
 * staleness test (test/clients-generated.test.ts).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const configsDir = join(here, '..', 'configs');
const outPath = join(here, '..', 'src', 'clients.generated.ts');

interface ClientMeta {
  id: string;
  displayName: string;
  /** SCREAMING_SNAKE_CASE constant key, e.g. 'claude-code' -> 'CLAUDE_CODE' */
  key: string;
  /** camelCase import binding, e.g. 'claude-code' -> 'claudeCodeConfig' */
  binding: string;
}

function toKey(id: string): string {
  return id.toUpperCase().replace(/-/g, '_');
}

function toBinding(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase()) + 'Config';
}

export function readClients(): ClientMeta[] {
  const files = readdirSync(configsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const base = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(join(configsDir, file), 'utf8')) as {
      id?: string;
      displayName?: string;
    };

    if (raw.id !== base) {
      throw new Error(
        `Config filename must match its id: ${file} declares id "${raw.id ?? '(missing)'}". ` +
          `Rename the file to "${raw.id}.json" or fix the id.`
      );
    }
    if (!raw.displayName) {
      throw new Error(`Config ${file} is missing a displayName.`);
    }

    return { id: base, displayName: raw.displayName, key: toKey(base), binding: toBinding(base) };
  });
}

export function generateClientsSource(clients: ClientMeta[] = readClients()): string {
  const imports = clients
    .map((c) => `import ${c.binding} from '../configs/${c.id}.json';`)
    .join('\n');

  const clientEntries = clients.map((c) => `  ${c.key}: '${c.id}',`).join('\n');
  const displayNameEntries = clients
    .map((c) => `  ${c.key}: ${JSON.stringify(c.displayName)},`)
    .join('\n');
  const displayByIdEntries = clients
    .map((c) => `  '${c.id}': ${JSON.stringify(c.displayName)},`)
    .join('\n');
  const idEntries = clients.map((c) => `  '${c.id}',`).join('\n');
  const configEntries = clients.map((c) => `  ${c.binding},`).join('\n');

  return `/**
 * AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated from configs/*.json by scripts/generate-clients.ts.
 * Run \`npm run generate:clients\` to regenerate after adding or editing a client.
 */
${imports}

/** Canonical client IDs, keyed by constant name. */
export const CLIENT = {
${clientEntries}
} as const;

/** Display names, keyed by the same constant name as {@link CLIENT}. */
export const CLIENT_DISPLAY_NAME = {
${displayNameEntries}
} as const;

/** Display names keyed by client id (used by getDisplayName). */
export const DISPLAY_NAME_BY_ID = {
${displayByIdEntries}
} as const;

/** All client ids as a literal tuple — the source for ClientIdSchema. */
export const CLIENT_IDS = [
${idEntries}
] as const;

/** Every client config, in id order. */
export const allClientConfigs = [
${configEntries}
];
`;
}

const source = generateClientsSource();
writeFileSync(outPath, source);

console.log(`✨ Generated src/clients.generated.ts (${readClients().length} clients)`);
