/**
 * Generate src/icons.generated.ts from the raw SVG files in icons/.
 *
 * The icons/<id>.svg files are the source of truth. Icons are OPTIONAL per
 * client: a config may have no icon (it is simply omitted from the manifest),
 * but every icon file must correspond to a real client config (no orphans).
 *
 * Each entry carries { fileName, title, source?, svg } (Simple Icons-style data
 * shape). The SVG is normalized (XML prolog stripped, root width/height dropped
 * so it scales via viewBox, and internal ids namespaced so several inlined icons
 * cannot collide) and embedded as a string for zero-config consumption.
 *
 * Run via `npm run generate:icons`. Guarded by test/icons-generated.test.ts.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, '..', 'icons');
const configsDir = join(here, '..', 'configs');
const outPath = join(here, '..', 'src', 'icons.generated.ts');

function ids(dir: string, ext: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => f.slice(0, -ext.length))
    .sort();
}

/** Strip the XML prolog, drop root width/height, and namespace internal ids. */
function normalizeSvg(id: string, raw: string): string {
  const start = raw.indexOf('<svg');
  if (start < 0) {
    throw new Error(`icons/${id}.svg has no <svg> element.`);
  }
  let svg = raw.slice(start).trim();
  svg = svg.replace(/^<svg\b[^>]*>/, (tag) => tag.replace(/\s(?:width|height)="[^"]*"/g, ''));
  const localIds = new Set<string>();
  for (const m of svg.matchAll(/\bid="([^"]+)"/g)) localIds.add(m[1]);
  for (const lid of localIds) {
    const e = lid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pfx = `${id}-${lid}`;
    svg = svg
      .replace(new RegExp(`\\bid="${e}"`, 'g'), `id="${pfx}"`)
      .replace(new RegExp(`url\\(#${e}\\)`, 'g'), `url(#${pfx})`)
      .replace(new RegExp(`href="#${e}"`, 'g'), `href="#${pfx}"`);
  }
  return svg;
}

export function generateIconsSource(): string {
  const configIds = new Set(ids(configsDir, '.json'));
  const iconIds = ids(iconsDir, '.svg');

  const orphans = iconIds.filter((id) => !configIds.has(id));
  if (orphans.length) {
    throw new Error(
      `icons/ has files with no matching config: ${orphans.join(', ')}. ` +
        `Each icons/<id>.svg must match a configs/<id>.json.`
    );
  }

  const sourcesPath = join(iconsDir, 'sources.json');
  const sources: Record<string, string> = existsSync(sourcesPath)
    ? JSON.parse(readFileSync(sourcesPath, 'utf8'))
    : {};

  const entries = iconIds
    .map((id) => {
      const svg = normalizeSvg(id, readFileSync(join(iconsDir, `${id}.svg`), 'utf8'));
      const config = JSON.parse(readFileSync(join(configsDir, `${id}.json`), 'utf8')) as {
        displayName: string;
      };
      const fields = [
        `fileName: ${JSON.stringify(`${id}.svg`)}`,
        `title: ${JSON.stringify(config.displayName)}`,
      ];
      if (sources[id]) fields.push(`source: ${JSON.stringify(sources[id])}`);
      fields.push(`svg: ${JSON.stringify(svg)}`);
      return `  ${JSON.stringify(id)}: { ${fields.join(', ')} },`;
    })
    .join('\n');

  return [
    '/**',
    ' * AUTO-GENERATED FILE - DO NOT EDIT BY HAND.',
    ' *',
    ' * Generated from icons/*.svg by scripts/generate-icons.ts.',
    ' * Run `npm run generate:icons` to regenerate after adding or editing an icon.',
    ' * Icons are optional per client; clients with no icon are omitted here.',
    ' */',
    'export const CLIENT_ICONS = {',
    entries,
    '} as const;',
    '',
  ].join('\n');
}

const source = generateIconsSource();
writeFileSync(outPath, source);

console.log('Generated src/icons.generated.ts');
