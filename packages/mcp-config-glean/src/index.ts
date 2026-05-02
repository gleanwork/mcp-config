import {
  MCPConfigRegistry,
  buildMcpServerName as buildMcpServerNameBase,
  type MCPConnectionOptions,
  type RegistryOptions,
} from '@gleanwork/mcp-config-schema';

// Re-export everything from the base package for convenience
export * from '@gleanwork/mcp-config-schema';

/**
 * Glean environment variable names.
 */
export const GLEAN_ENV = {
  /**
   * Environment variable for Glean instance name (e.g., 'my-company')
   * @deprecated Use {@link GLEAN_ENV.SERVER_URL GLEAN_SERVER_URL} instead.
   */
  INSTANCE: 'GLEAN_INSTANCE',
  /**
   * Environment variable for full Glean URL (e.g., 'https://my-company.glean.com')
   * @deprecated Use {@link GLEAN_ENV.SERVER_URL GLEAN_SERVER_URL} instead.
   */
  URL: 'GLEAN_URL',
  /** Environment variable for Glean server URL (e.g., 'https://my-company-be.glean.com') */
  SERVER_URL: 'GLEAN_SERVER_URL',
  /** Environment variable for Glean API token */
  API_TOKEN: 'GLEAN_API_TOKEN',
} as const;

/**
 * Glean-specific registry options.
 *
 * This registry only supports the remote (HTTP) transport. Local/stdio
 * installation is intentionally not offered: `serverPackage` is omitted so
 * that `buildConfiguration({ transport: 'stdio' })` throws, and the stdio
 * command builder is not registered so `buildCommand` returns null for stdio.
 */
export const GLEAN_REGISTRY_OPTIONS: RegistryOptions = {
  tokenEnvVarName: GLEAN_ENV.API_TOKEN,
  commandBuilder: {
    http: (clientId, options) => {
      if (!options.serverUrl) return null;

      const pkg = options.cliVersion
        ? `@gleanwork/configure-mcp-server@${options.cliVersion}`
        : '@gleanwork/configure-mcp-server';
      let command = `npx -y ${pkg} remote --url ${options.serverUrl} --client ${clientId}`;

      const authHeader = options.headers?.['Authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        command += ` --token ${token}`;
      }

      return command;
    },
  },
  serverNameBuilder: (options) => {
    return buildGleanServerName(options);
  },
};

/**
 * Helper to create Glean environment variables for stdio transport.
 *
 * @deprecated Use {@link createGleanServerUrlEnv} instead.
 * @param instance - Glean instance name (e.g., 'my-company')
 * @param apiToken - Optional API token
 * @returns Environment variables object for use in MCPConnectionOptions.env
 */
export function createGleanEnv(instance: string, apiToken?: string): Record<string, string> {
  return {
    [GLEAN_ENV.INSTANCE]: instance,
    ...(apiToken && { [GLEAN_ENV.API_TOKEN]: apiToken }),
  };
}

/**
 * Helper to create Glean environment variables using a full URL.
 *
 * @deprecated Use {@link createGleanServerUrlEnv} instead.
 * @param url - Full Glean URL (e.g., 'https://my-company.glean.com')
 * @param apiToken - Optional API token
 * @returns Environment variables object for use in MCPConnectionOptions.env
 */
export function createGleanUrlEnv(url: string, apiToken?: string): Record<string, string> {
  return {
    [GLEAN_ENV.URL]: url,
    ...(apiToken && { [GLEAN_ENV.API_TOKEN]: apiToken }),
  };
}

/**
 * Helper to create Glean environment variables using a server URL.
 *
 * Populates the env vars consumed by any Glean-aware MCP server or CLI that
 * reads `GLEAN_SERVER_URL` / `GLEAN_API_TOKEN` (e.g., a self-hosted stdio
 * server). This package's own registry is remote-only and does not consume
 * these env vars.
 *
 * @param serverUrl - Full Glean server URL (e.g., 'https://my-company-be.glean.com')
 * @param apiToken - Optional API token
 * @returns Env-var object suitable for a child process' environment
 */
export function createGleanServerUrlEnv(
  serverUrl: string,
  apiToken?: string
): Record<string, string> {
  return {
    [GLEAN_ENV.SERVER_URL]: serverUrl,
    ...(apiToken && { [GLEAN_ENV.API_TOKEN]: apiToken }),
  };
}

/**
 * Helper to create Glean authorization headers for HTTP transport.
 *
 * @param apiToken - Glean API token
 * @returns Headers object for use in MCPConnectionOptions.headers
 *
 * @example
 * ```typescript
 * const config = builder.buildConfiguration({
 *   transport: 'http',
 *   serverUrl: 'https://my-company-be.glean.com/mcp/default',
 *   headers: createGleanHeaders('my-api-token'),
 * });
 * ```
 */
export function createGleanHeaders(apiToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiToken}`,
  };
}

/**
 * Create an MCPConfigRegistry pre-configured with Glean defaults (remote/HTTP only).
 *
 * @returns MCPConfigRegistry configured for Glean's remote MCP server
 *
 * @example
 * ```typescript
 * const registry = createGleanRegistry();
 * const builder = registry.createBuilder('cursor');
 *
 * const httpConfig = builder.buildConfiguration({
 *   transport: 'http',
 *   serverUrl: buildGleanMcpUrl('https://my-company-be.glean.com'),
 *   headers: createGleanHeaders('my-api-token'),
 * });
 * ```
 */
export function createGleanRegistry(): MCPConfigRegistry {
  return new MCPConfigRegistry(GLEAN_REGISTRY_OPTIONS);
}

/**
 * Build a Glean MCP endpoint URL from a server URL.
 *
 * @param serverUrl - Glean server URL (e.g., 'https://my-company-be.glean.com')
 * @param endpoint - MCP endpoint (default: 'default')
 * @returns Full Glean MCP endpoint URL
 *
 * @example
 * ```typescript
 * const url = buildGleanMcpUrl('https://my-company-be.glean.com');
 * // Returns: 'https://my-company-be.glean.com/mcp/default'
 *
 * const customUrl = buildGleanMcpUrl('https://my-company-be.glean.com', 'custom');
 * // Returns: 'https://my-company-be.glean.com/mcp/custom'
 * ```
 */
export function buildGleanMcpUrl(serverUrl: string, endpoint: string = 'default'): string {
  return `${serverUrl.replace(/\/+$/, '')}/mcp/${endpoint}`;
}

/**
 * Build the Glean MCP server URL from an instance name.
 *
 * @deprecated Use {@link buildGleanMcpUrl} with a fully qualified server URL instead.
 * @param instance - Glean instance name (e.g., 'my-company')
 * @param endpoint - MCP endpoint (default: 'default')
 * @returns Full Glean MCP server URL
 */
export function buildGleanServerUrl(instance: string, endpoint: string = 'default'): string {
  return `https://${instance}-be.glean.com/mcp/${endpoint}`;
}

// Type helpers for Glean-specific usage
export type GleanEnvVars = {
  [GLEAN_ENV.INSTANCE]?: string;
  [GLEAN_ENV.URL]?: string;
  [GLEAN_ENV.SERVER_URL]?: string;
  [GLEAN_ENV.API_TOKEN]?: string;
};

/**
 * Options for Glean-specific connection configuration.
 * Extends MCPConnectionOptions with Glean-specific properties.
 */
export interface GleanConnectionOptions extends MCPConnectionOptions {
  /** Product name for white-label support (e.g., 'Glean', 'Acme Platform') */
  productName?: string;
  /** Use agents endpoint instead of default */
  agents?: boolean;
}

/**
 * Normalize a product name to a safe identifier.
 * Used for white-label support in Glean configurations.
 *
 * @param productName - Product name (e.g., 'Glean', 'Acme Platform')
 * @returns Normalized product name (e.g., 'glean', 'acme_platform')
 *
 * @example
 * ```typescript
 * normalizeGleanProductName('Glean'); // 'glean'
 * normalizeGleanProductName('Acme Platform'); // 'acme_platform'
 * normalizeGleanProductName('My-Product'); // 'my_product'
 * ```
 */
export function normalizeGleanProductName(productName?: string): string {
  if (!productName) {
    return 'glean';
  }
  const normalized = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return normalized || 'glean';
}

/**
 * Build a Glean-prefixed server name for MCP configurations.
 * Wraps the vendor-neutral buildMcpServerName with Glean-specific prefixing.
 *
 * This function keeps the `'stdio' | 'http'` union on `transport` to remain
 * compatible with {@link ServerNameBuilderCallback}, but the Glean registry
 * itself no longer emits stdio invocations — stdio callers will still get a
 * sensible `{product}_local` name if invoked directly.
 *
 * Rules:
 * - If explicit serverName is provided and already has the product prefix, use it directly
 * - If explicit serverName is provided without prefix, add the product prefix
 * - If agents flag is set, return '{product}_agents'
 * - For http transport with URL: '{product}_{extracted-name}'
 * - Fallback: '{product}'
 *
 * @param options - Server name options
 * @returns Prefixed server name (e.g., 'glean_default', 'acme_analytics')
 *
 * @example
 * ```typescript
 * buildGleanServerName({ transport: 'http', serverUrl: '.../mcp/analytics' }); // 'glean_analytics'
 * buildGleanServerName({ agents: true }); // 'glean_agents'
 * buildGleanServerName({ serverName: 'custom' }); // 'glean_custom'
 * ```
 */
export function buildGleanServerName(options: {
  transport?: 'stdio' | 'http';
  serverUrl?: string;
  serverName?: string;
  productName?: string;
  agents?: boolean;
}): string {
  const productPrefix = normalizeGleanProductName(options.productName);

  if (options.serverName) {
    if (
      options.serverName === productPrefix ||
      options.serverName.startsWith(`${productPrefix}_`)
    ) {
      return options.serverName;
    }
    return `${productPrefix}_${options.serverName}`;
  }

  if (options.agents) {
    return `${productPrefix}_agents`;
  }

  const baseName = buildMcpServerNameBase({
    transport: options.transport,
    serverUrl: options.serverUrl,
  });

  if (baseName === 'default' && !options.transport && !options.serverUrl) {
    return productPrefix;
  }

  return `${productPrefix}_${baseName}`;
}

/**
 * Normalize a server name with Glean product prefix.
 * Ensures the server name has the correct product prefix and is safe for use as a configuration key.
 *
 * @param name - Server name to normalize
 * @param productName - Optional product name for white-label support
 * @returns Normalized server name with product prefix
 *
 * @example
 * ```typescript
 * normalizeGleanServerName('custom'); // 'glean_custom'
 * normalizeGleanServerName('glean_custom'); // 'glean_custom' (no double prefix)
 * normalizeGleanServerName('custom', 'acme'); // 'acme_custom'
 * ```
 */
export function normalizeGleanServerName(name: string, productName?: string): string {
  const productPrefix = normalizeGleanProductName(productName);

  if (!name) {
    return productPrefix;
  }

  const lowerName = name.toLowerCase();

  // If it already starts with the prefix, return as-is
  if (lowerName === productPrefix || lowerName.startsWith(`${productPrefix}_`)) {
    return lowerName;
  }

  // Handle case where name starts with just the product (e.g., 'gleancustom' -> 'glean_custom')
  if (lowerName.startsWith(productPrefix) && lowerName.length > productPrefix.length) {
    const rest = lowerName.slice(productPrefix.length);
    return `${productPrefix}_${rest}`;
  }

  return `${productPrefix}_${lowerName}`;
}
