# @gleanwork/mcp-config-schema

Type-safe configuration schemas and builders for MCP (Model Context Protocol) clients.

## The Problem

MCP servers need to work across many different AI coding assistants—Claude Code, VS Code, Cursor, Claude Desktop, Windsurf, Goose, Codex, and more. Each client has its own:

- **Configuration format**: JSON, YAML, or TOML
- **File location**: Different paths on macOS, Linux, and Windows
- **Property names**: `url` vs `serverUrl` vs `uri`, `command` vs `cmd`, `mcpServers` vs `servers` vs `extensions`
- **Transport support**: Some support HTTP natively, others require the `mcp-remote` bridge
- **Authentication patterns**: Headers, environment variables, or OAuth

Without a unified solution, MCP server authors face a maintenance nightmare: writing and maintaining separate configuration logic for each client, tracking which clients support which features, and keeping up with changes across the ecosystem.

## The Solution

This package provides a **single source of truth** for MCP client configurations. You describe your connection once, and it generates the correct configuration for any supported client:

```typescript
import { MCPConfigRegistry } from '@gleanwork/mcp-config-schema';

const registry = new MCPConfigRegistry();

// Same options work for any client
const options = {
  transport: 'http',
  serverUrl: 'https://api.example.com/mcp/default',
  serverName: 'my-server',
  headers: { Authorization: 'Bearer token' },
};

// Generate correct config for each client
registry.createBuilder('cursor').buildConfiguration(options);      // → JSON with mcpServers
registry.createBuilder('vscode').buildConfiguration(options);      // → JSON with servers
registry.createBuilder('goose').buildConfiguration(options);       // → YAML with extensions
registry.createBuilder('claude-desktop').buildConfiguration(options); // → JSON with mcp-remote bridge
```

The package handles all the complexity: format differences, property mapping, platform-specific paths, transport bridging, and one-click installation URLs.

## Installation

```bash
npm install @gleanwork/mcp-config-schema
```

## Quick Start

### stdio Transport (Local Server)

For stdio transport, provide registry options with your package names, then pass environment variables directly:

```typescript
import { MCPConfigRegistry } from '@gleanwork/mcp-config-schema';

const registry = new MCPConfigRegistry({
  serverPackage: '@your-org/mcp-server', // Your stdio server package
});

const builder = registry.createBuilder('cursor');

// Generate configuration for stdio transport with custom environment variables
const config = builder.buildConfiguration({
  transport: 'stdio',
  env: {
    MY_INSTANCE: 'my-instance',
    MY_API_TOKEN: 'my-api-token',
  },
});
```

### HTTP Transport (Remote Server)

For connecting to HTTP-based MCP servers, no additional configuration is needed:

```typescript
import { MCPConfigRegistry } from '@gleanwork/mcp-config-schema';

const registry = new MCPConfigRegistry();
const builder = registry.createBuilder('cursor');

// Generate configuration for HTTP transport
const config = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://your-server.com/mcp/default',
  serverName: 'my-server',
});

// Write configuration to the client's config file (Node.js only)
await builder.writeConfiguration({
  transport: 'http',
  serverUrl: 'https://your-server.com/mcp/default',
  serverName: 'my-server',
});

// Generate one-click install URL for supported clients (Cursor, VS Code)
const oneClickUrl = builder.buildOneClickUrl({
  transport: 'http',
  serverUrl: 'https://your-server.com/mcp/default',
  serverName: 'my-server',
});
// Returns: cursor://anysphere.cursor-deeplink/mcp/install?name=my-server&config=...
```

### HTTP Transport with Headers

For HTTP transport with authentication or custom headers:

```typescript
const config = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/mcp/default',
  serverName: 'my-server',
  headers: {
    Authorization: 'Bearer my-api-token',
    'X-Custom-Header': 'custom-value',
  },
});
```

### URL Templates with Variables

For dynamic URLs with template variables (aligned with MCP registry specification):

```typescript
const config = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/{region}/mcp/{endpoint}',
  urlVariables: {
    region: 'us-east-1',
    endpoint: 'default',
  },
  serverName: 'my-server',
});
// Generates config with URL: https://api.example.com/us-east-1/mcp/default
```

## What This Package Does

This package serves as the **Single Source of Truth** for MCP client configurations. It provides:

- **Registry** of all MCP clients and their capabilities
- **Configuration builders** that generate correct configs for each client
- **Type-safe schemas** with TypeScript types and Zod validation
- **Browser support** for web-based configuration tools
- **Client detection** to identify which clients need special handling

## Supported Clients

For detailed configuration examples and requirements for each client, see **[CLIENTS.md](CLIENTS.md)**.

### Centrally Managed Clients

- **ChatGPT** - Requires web UI configuration
- **Claude for Teams/Enterprise** - Managed by organization admins

## Core Usage

### Query Client Capabilities

```typescript
import { MCPConfigRegistry } from '@gleanwork/mcp-config-schema';

const registry = new MCPConfigRegistry();

// Get client configuration
const cursorConfig = registry.getConfig('cursor');
console.log(cursorConfig.displayName); // "Cursor"
console.log(cursorConfig.userConfigurable); // true
console.log(cursorConfig.transports); // ['stdio', 'http']
console.log(cursorConfig.types); // ['ide']

// Query different client groups
const httpClients = registry.getNativeHttpClients();
const bridgeClients = registry.getBridgeRequiredClients();
const macClients = registry.getClientsByPlatform('darwin');
```

### Client Types

Every client declares one or more `types` describing where it runs. A client can be more than one (e.g. Goose ships both a desktop app and a CLI). Use these to group or filter clients by surface — for example, to build a filterable list of supported hosts:

```typescript
import {
  MCPConfigRegistry,
  CLIENT_TYPES, // readonly ['cli', 'desktop', 'ide', 'web']
  TYPE_LABELS, // { cli: 'CLI', desktop: 'Desktop', ide: 'IDE', web: 'Web' }
  type ClientType,
} from '@gleanwork/mcp-config-schema';

const registry = new MCPConfigRegistry();
const all = registry.getAllConfigs();

// Filter by type
const cliClients = all.filter((c) => c.types.includes('cli'));

// Group by type, with display labels (a client may appear under several)
for (const type of CLIENT_TYPES) {
  const inType = all.filter((c) => c.types.includes(type));
  console.log(`${TYPE_LABELS[type]}: ${inType.map((c) => c.displayName).join(', ')}`);
}
```

Installability is a separate axis (`userConfigurable`): user-installable clients vs. centrally managed ones.

Consumers can provide setup destinations for centrally managed clients without
adding vendor-specific URLs to the shared client metadata:

```typescript
const registry = new MCPConfigRegistry({
  managedSetupUrls: {
    'cursor-team': 'https://example.com/admin/mcp',
  },
});

registry.getManagedSetupUrl('cursor-team'); // https://example.com/admin/mcp
```

### Generate Configurations

```typescript
const builder = registry.createBuilder('claude-code');

// HTTP transport (remote server) configuration
const remoteConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/mcp/default',
  serverName: 'my-server',
  headers: { Authorization: 'Bearer your-token' }, // Optional headers
});

// HTTP transport with URL template variables
const dynamicConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/{region}/mcp/{endpoint}',
  urlVariables: { region: 'us-east-1', endpoint: 'default' },
  serverName: 'my-server',
});

// stdio transport (local server) configuration
// Note: Requires registry options with serverPackage
const localConfig = builder.buildConfiguration({
  transport: 'stdio',
  env: {
    YOUR_INSTANCE: 'your-instance',
    YOUR_API_TOKEN: 'your-api-token',
  },
});

// Generate partial configuration (without root object)
const partialConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/mcp/default',
  serverName: 'my-server',
  includeRootObject: false, // Returns just the server entry without mcpServers wrapper
});
// Returns: { "my-server": { "type": "http", "url": "..." } }
// Instead of: { "mcpServers": { "my-server": { "type": "http", "url": "..." } } }
```

#### Partial Configuration (without root object)

The `includeRootObject` option allows you to generate just the server configuration entry without the outer wrapper (`mcpServers`, `servers`, or `extensions` depending on the client). This is useful when you need to merge configurations into an existing setup:

```typescript
// Generate partial config for merging into existing configuration
const partialConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://api.example.com/mcp/default',
  serverName: 'my_server',
  includeRootObject: false,
});

// Now you can easily merge it into an existing config
const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
existingConfig.mcpServers = {
  ...existingConfig.mcpServers,
  ...partialConfig,
};
fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
```

### Validate Configurations

```typescript
import {
  validateConnectionOptions,
  safeValidateConnectionOptions,
} from '@gleanwork/mcp-config-schema';

// Validate connection options
const result = safeValidateConnectionOptions({
  transport: 'http',
  serverUrl: 'https://your-server.com/mcp/default',
});

if (!result.success) {
  console.error('Validation errors:', result.error.issues);
}
```

## Browser Support

This package works in browsers! Use the `/browser` import path:

```javascript
// Browser-safe import
import { MCPConfigRegistry, ConfigBuilder } from '@gleanwork/mcp-config-schema/browser';

const registry = new MCPConfigRegistry();
const builder = registry.createBuilder('cursor');

// Generate configuration (works in browser)
const config = builder.buildConfiguration({
  transport: 'http',
  serverUrl: 'https://your-server.com/mcp/default',
});

// Copy to clipboard
navigator.clipboard.writeText(JSON.stringify(config, null, 2));
```

**Note:** File operations (`writeConfiguration`, `getConfigPath`) are not available in browsers and will throw clear error messages.

### React Example

```tsx
import React from 'react';
import { MCPConfigRegistry, ClientId } from '@gleanwork/mcp-config-schema/browser';

function MCPConfigGenerator() {
  const registry = new MCPConfigRegistry();

  const handleGenerateConfig = (clientId: ClientId, serverUrl: string) => {
    const builder = registry.createBuilder(clientId);
    const config = builder.buildConfiguration({
      transport: 'http',
      serverUrl,
      serverName: 'my-server',
    });

    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  const clients = registry.getSupportedClients();

  return (
    <div>
      {clients.map((client) => (
        <button
          key={client.id}
          onClick={() => handleGenerateConfig(client.id, 'https://api.example.com/mcp')}
        >
          Configure {client.displayName}
        </button>
      ))}
    </div>
  );
}
```

## Configuration Examples

> **📖 For complete configuration examples for all clients, see [CLIENTS.md](CLIENTS.md)**

### Native HTTP Client (Claude Code, VS Code)

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://your-server.com/mcp/default"
    }
  }
}
```

### stdio-only Clients (Claude Desktop, Junie, JetBrains AI)

These clients require `mcp-remote` bridge for HTTP servers:

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-server.com/mcp/default"]
    }
  }
}
```

### Goose (YAML format with native HTTP)

```yaml
extensions:
  my-server:
    enabled: true
    name: my-server
    type: streamable_http
    uri: https://your-server.com/mcp/default
    envs: {}
    env_keys: []
    headers: {}
    description: ''
    timeout: 300
    bundled: null
    available_tools: []
```

## API Reference

For complete API documentation, see the TypeScript definitions in [`src/types.ts`](./src/types.ts) and [`src/registry.ts`](./src/registry.ts). All exports include JSDoc comments.

Key exports:

- **`MCPConfigRegistry`** - Main entry point for creating configuration builders
- **`BaseConfigBuilder`** - Base class for client-specific builders
- **`MCPConnectionOptions`** - Options for `buildConfiguration()`
- **`RegistryOptions`** - Options for customizing the registry
- **`ClientId`** - Union type of all supported client identifiers

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm run test

# Run all checks (lint, typecheck, test)
npm run test:all

# Generate documentation
npm run generate:docs
```

## Documentation

- **[CLIENTS.md](CLIENTS.md)** - Comprehensive client compatibility matrix with detailed configuration examples
- **[API Reference](#api-reference)** - Complete API documentation

## Icons

Each client ships an SVG host icon, available as an inline string (no bundler/loader setup) and as a raw file under `icons/`:

```typescript
import { CLIENT, CLIENT_ICONS, getClientIcon } from '@gleanwork/mcp-config-schema';

getClientIcon(CLIENT.CURSOR); // '<svg …>…</svg>' (or undefined if none)

// React (icons inherit text color via the surrounding `color`)
<span style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: getClientIcon(clientId) ?? '' }} />
```

Icons are optional per client; `getClientIcon` returns `undefined` when one isn't shipped. Internal SVG ids are namespaced per icon, so multiple icons can be inlined on the same page without collisions. See [`icons/README.md`](icons/README.md) to add or update one.

## Trademarks

Product names and the client icons under `icons/` are trademarks of their respective owners. They are included only to identify the MCP host applications this package supports (nominative use); their inclusion does not imply affiliation with or endorsement by those owners. Brand icons are sourced from [svgl](https://svgl.app), [Simple Icons](https://simpleicons.org) (CC0), and official brand assets.

## License

MIT - See [LICENSE](LICENSE) file for details

## Contributing

This package is part of the Glean MCP ecosystem. For issues and contributions, please visit the repository.
