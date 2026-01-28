# @gleanwork/mcp-config-glean

Glean-specific MCP configuration defaults and helpers. Wraps `@gleanwork/mcp-config-schema` with Glean-specific constants and convenience functions.

## Installation

```bash
npm install @gleanwork/mcp-config-glean
```

## Usage

### Quick Start

```typescript
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
} from '@gleanwork/mcp-config-glean';

// Create a pre-configured registry
const registry = createGleanRegistry();
const builder = registry.createBuilder('cursor');

// Generate stdio configuration
const stdioConfig = builder.buildConfiguration({
  transport: 'stdio',
  env: createGleanEnv('my-company', 'my-api-token'),
});

// Generate HTTP configuration
const httpConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: buildGleanServerUrl('my-company'),
  headers: createGleanHeaders('my-api-token'),
});
```

### Available Exports

#### Constants

```typescript
import { GLEAN_REGISTRY_OPTIONS, GLEAN_ENV } from '@gleanwork/mcp-config-glean';

// Registry options for Glean MCP server
GLEAN_REGISTRY_OPTIONS.serverPackage     // '@gleanwork/local-mcp-server'
GLEAN_REGISTRY_OPTIONS.tokenEnvVarName   // 'GLEAN_API_TOKEN'
GLEAN_REGISTRY_OPTIONS.commandBuilder    // Functions to generate CLI commands
GLEAN_REGISTRY_OPTIONS.serverNameBuilder // Callback that prefixes server names with glean_

// Environment variable names
GLEAN_ENV.INSTANCE   // 'GLEAN_INSTANCE'
GLEAN_ENV.URL        // 'GLEAN_URL'
GLEAN_ENV.API_TOKEN  // 'GLEAN_API_TOKEN'
```

#### Helper Functions

| Function | Description |
|----------|-------------|
| `createGleanRegistry()` | Create MCPConfigRegistry with Glean defaults |
| `createGleanEnv(instance, apiToken?)` | Create env vars using instance name |
| `createGleanUrlEnv(url, apiToken?)` | Create env vars using full URL |
| `createGleanHeaders(apiToken)` | Create Authorization header |
| `buildGleanServerUrl(instance, endpoint?)` | Build Glean MCP server URL |
| `normalizeGleanProductName(productName?)` | Normalize product name for white-labeling (defaults to 'glean') |
| `buildGleanServerName(options)` | Build server name with glean_ prefix |
| `normalizeGleanServerName(name, productName?)` | Normalize server name to safe config key with prefix |

#### Server Name Functions

These functions handle server name generation with proper prefixing:

```typescript
import {
  normalizeGleanProductName,
  buildGleanServerName,
  normalizeGleanServerName,
} from '@gleanwork/mcp-config-glean';

// Normalize product names for white-labeling
normalizeGleanProductName();              // 'glean'
normalizeGleanProductName('Acme Corp');   // 'acme_corp'

// Build server names with glean_ prefix
buildGleanServerName({ transport: 'stdio' });                              // 'glean_local'
buildGleanServerName({ transport: 'http' });                               // 'glean_default'
buildGleanServerName({ transport: 'http', serverUrl: '.../mcp/analytics' }); // 'glean_analytics'
buildGleanServerName({ serverName: 'custom' });                            // 'glean_custom'
buildGleanServerName({ agents: true });                                    // 'glean_agents'

// Normalize existing server names
normalizeGleanServerName('custom');        // 'glean_custom'
normalizeGleanServerName('glean_custom');  // 'glean_custom' (no double prefix)
```

#### Types

```typescript
import type { GleanConnectionOptions, GleanEnvVars } from '@gleanwork/mcp-config-glean';

// GleanConnectionOptions extends MCPConnectionOptions with:
// - productName?: string  (for white-label support)
// - agents?: boolean      (use agents endpoint)
```

### Re-exports

This package re-exports everything from `@gleanwork/mcp-config-schema`, so you can import both Glean-specific and generic types from a single package:

```typescript
import {
  // Glean-specific
  createGleanRegistry,
  createGleanEnv,
  GLEAN_ENV,

  // From mcp-config-schema
  MCPConfigRegistry,
  type MCPConnectionOptions,
  type ClientId,
} from '@gleanwork/mcp-config-glean';
```

## Migration from @gleanwork/mcp-config

If you're migrating from the older `@gleanwork/mcp-config` package:

1. Update your package.json:
   ```diff
   - "@gleanwork/mcp-config": "^3.x"
   + "@gleanwork/mcp-config-glean": "^4.x"
   ```

2. Update your imports:
   ```diff
   - import { ... } from '@gleanwork/mcp-config';
   + import { ... } from '@gleanwork/mcp-config-glean';
   ```

The API is fully compatible - no code changes required beyond the import path.

## Related Packages

- **[@gleanwork/mcp-config-schema](https://www.npmjs.com/package/@gleanwork/mcp-config-schema)** - Vendor-neutral base package with core types and builders

## License

MIT
