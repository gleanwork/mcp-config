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
