/**
 * Client id and display-name constants.
 *
 * The values are generated from configs/*.json by scripts/generate-clients.ts;
 * this module layers the public types and the getDisplayName helper on top of
 * the generated data. To add or rename a client, edit the config file and run
 * `npm run generate:clients`.
 */
import { CLIENT, CLIENT_DISPLAY_NAME, DISPLAY_NAME_BY_ID } from './clients.generated.js';

export { CLIENT, CLIENT_DISPLAY_NAME };

/**
 * Type-safe client ID type derived from the constants
 */
export type ClientIdConstant = (typeof CLIENT)[keyof typeof CLIENT];

/**
 * Type-safe display name type derived from the constants
 */
export type ClientDisplayName = (typeof CLIENT_DISPLAY_NAME)[keyof typeof CLIENT_DISPLAY_NAME];

/**
 * Helper to get display name from client ID
 */
export function getDisplayName(clientId: ClientIdConstant): ClientDisplayName {
  return DISPLAY_NAME_BY_ID[clientId];
}

/**
 * The kinds of client an MCP host can be, by where it runs. A client may be
 * more than one (e.g. Goose ships a desktop app and a CLI). This is the source
 * for both the `ClientType` type and the `types` field's Zod enum in schemas.ts.
 */
export const CLIENT_TYPES = ['cli', 'desktop', 'ide', 'web'] as const;

/** A single client type. See {@link CLIENT_TYPES}. */
export type ClientType = (typeof CLIENT_TYPES)[number];

/** Human-readable labels for each {@link ClientType} (e.g. for filter chips). */
export const TYPE_LABELS: Record<ClientType, string> = {
  cli: 'CLI',
  desktop: 'Desktop',
  ide: 'IDE',
  web: 'Web',
};
