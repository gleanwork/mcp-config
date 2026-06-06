/**
 * Per-client host icons.
 *
 * The data is generated from the raw files in `icons/` (see
 * scripts/generate-icons.ts) following a Simple Icons-style shape. Each icon is
 * available as an inline SVG string (no bundler/loader setup) and as a raw file
 * under `icons/` (importable via the `./icons/*.svg` subpath export).
 */
import type { ClientId } from './types.js';
import { CLIENT_ICONS } from './icons.generated.js';

export interface ClientIcon {
  /** File name of the raw SVG shipped under the package's `icons/` directory. */
  fileName: string;
  /** Display name of the client this icon represents. */
  title: string;
  /** Where the icon asset was sourced from (provenance / attribution). */
  source?: string;
  /** Inline SVG markup. Brand-colored where the brand is; mono marks inherit `currentColor`. */
  svg: string;
}

export { CLIENT_ICONS };

/**
 * Returns the inline SVG markup for a client's host icon, or `undefined` if the
 * client has no icon shipped. For the full record (title, source, file name),
 * read `CLIENT_ICONS[clientId]`.
 */
export function getClientIcon(clientId: ClientId): string | undefined {
  return (CLIENT_ICONS as Record<string, ClientIcon>)[clientId]?.svg;
}
