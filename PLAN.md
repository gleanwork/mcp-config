# Upstream Plan: Expose HTTP Type Value in `@gleanwork/mcp-config-schema`

## Repository

- **Repo**: [github.com/gleanwork/mcp-config](https://github.com/gleanwork/mcp-config)
- **Package**: `packages/mcp-config-schema`
- **Current Version**: 4.1.1

## Problem

The HTTP "type" value that each MCP client expects (e.g., `"http"`, `"streamable_http"`) is **hardcoded inside each builder class** and not exposed as part of the client configuration data.

Currently, each builder's `buildHttpConfig()` sets the type value internally:

| Builder | Source File | Line | Hardcoded Value |
|---------|-------------|------|-----------------|
| `GenericConfigBuilder` | `src/builders/GenericConfigBuilder.ts` | 83 | `"http"` |
| `VSCodeConfigBuilder` | `src/builders/VSCodeConfigBuilder.ts` | 84 | `"http"` |
| `GooseConfigBuilder` | `src/builders/GooseConfigBuilder.ts` | 90 | `"streamable_http"` |
| `OpenCodeConfigBuilder` | `src/builders/OpenCodeConfigBuilder.ts` | 65 | `"remote"` |
| `CodexConfigBuilder` | `src/builders/CodexConfigBuilder.ts` | — | *(does not set type)* |

Note: `CursorConfigBuilder`, `ClaudeCodeConfigBuilder`, and `GeminiConfigBuilder` all inherit `buildHttpConfig()` from `GenericConfigBuilder`.

The `httpPropertyMapping` in each client's config JSON only exposes the **property name** (`typeProperty: "type"`), not the **property value**. This means consumers that generate config outside the builder (such as the MDM script generator) must hardcode or guess the correct type value — which led to [PROD-23043](https://askscio.atlassian.net/browse/PROD-23043) where `"remote"` was used instead of `"streamable_http"` for Goose.

## Proposed Change

Add an optional `typeValue` field to `HttpConfigStructureSchema` and populate it in each client's config JSON.

### Schema Change

**File**: `packages/mcp-config-schema/src/schemas.ts` (or wherever `HttpConfigStructureSchema` is defined)

```typescript
// BEFORE
const HttpConfigStructureSchema = z.object({
  typeProperty: z.string().optional(),
  urlProperty: z.string(),
  headersProperty: z.string().optional(),
})

// AFTER
const HttpConfigStructureSchema = z.object({
  typeProperty: z.string().optional(),
  typeValue: z.string().optional(),     // ← NEW: e.g., "http", "streamable_http"
  urlProperty: z.string(),
  headersProperty: z.string().optional(),
})
```

The field is optional to maintain backward compatibility — clients without a `typeProperty` (like Codex) simply omit both `typeProperty` and `typeValue`.

### Config JSON Updates

Update each client's `configs/<client>.json` to include `typeValue` alongside `typeProperty`:

| File | Change |
|------|--------|
| `configs/claude-code.json` | Add `"typeValue": "http"` to `httpPropertyMapping` |
| `configs/cursor.json` | Add `"typeValue": "http"` to `httpPropertyMapping` |
| `configs/cursor-agent.json` | Add `"typeValue": "http"` to `httpPropertyMapping` |
| `configs/vscode.json` | Add `"typeValue": "http"` to `httpPropertyMapping` |
| `configs/jetbrains.json` | Add `"typeValue": "http"` to `httpPropertyMapping` |
| `configs/opencode.json` | Add `"typeValue": "remote"` to `httpPropertyMapping` |
| `configs/goose.json` | Add `"typeValue": "streamable_http"` to `httpPropertyMapping` |
| `configs/windsurf.json` | No change — does not have `typeProperty` |
| `configs/gemini.json` | No change — does not have `typeProperty` |
| `configs/codex.json` | No change — does not have `typeProperty` |
| `configs/chatgpt.json` | No change — no `httpPropertyMapping` (web-based, not user-configurable) |
| `configs/claude-desktop.json` | No change — no `httpPropertyMapping` (stdio-only, uses mcp-remote bridge) |
| `configs/claude-teams-enterprise.json` | No change — no `httpPropertyMapping` (centrally managed) |
| `configs/junie.json` | No change — no `httpPropertyMapping` (stdio-only, uses mcp-remote bridge) |

**Example (`configs/goose.json`):**

```json
{
  "configStructure": {
    "serversPropertyName": "extensions",
    "httpPropertyMapping": {
      "typeProperty": "type",
      "typeValue": "streamable_http",
      "urlProperty": "uri"
    }
  }
}
```

**Example (`configs/cursor.json`):**

```json
{
  "configStructure": {
    "serversPropertyName": "mcpServers",
    "httpPropertyMapping": {
      "typeProperty": "type",
      "typeValue": "http",
      "urlProperty": "url",
      "headersProperty": "headers"
    }
  }
}
```

### Builder Refactor

Update each builder's `buildHttpConfig()` to read `typeValue` from config instead of hardcoding:

**Before** (e.g., `GooseConfigBuilder`):
```typescript
if (httpPropertyMapping.typeProperty) {
  serverConfig[httpPropertyMapping.typeProperty] = "streamable_http"; // hardcoded
}
```

**After**:
```typescript
if (httpPropertyMapping.typeProperty && httpPropertyMapping.typeValue) {
  serverConfig[httpPropertyMapping.typeProperty] = httpPropertyMapping.typeValue;
}
```

This change applies to:
- `GenericConfigBuilder.buildHttpConfig()` (line 83) — replace `"http"` with `httpPropertyMapping.typeValue`. This also covers `CursorConfigBuilder`, `ClaudeCodeConfigBuilder`, and `GeminiConfigBuilder` which inherit from `GenericConfigBuilder`.
- `VSCodeConfigBuilder.buildHttpConfig()` (line 84) — replace `"http"` with `httpPropertyMapping.typeValue`
- `GooseConfigBuilder.buildHttpConfig()` (line 90) — replace `"streamable_http"` with `httpPropertyMapping.typeValue`
- `OpenCodeConfigBuilder.buildHttpConfig()` (line 65) — replace hardcoded `'remote'` with `httpPropertyMapping.typeValue`. **Note:** This builder currently does not read from `httpPropertyMapping` at all — it constructs `{ type: 'remote', url: resolvedUrl }` as object literals directly. This needs to be refactored to read `typeProperty` and `typeValue` from `httpPropertyMapping`, similar to the other builders.
- `CodexConfigBuilder.buildHttpConfig()` — no change needed (has no `typeProperty`)

### Type Export Update

The `HttpConfigStructure` type (derived from the Zod schema) will automatically include the new field:

```typescript
type HttpConfigStructure = {
  typeProperty?: string
  typeValue?: string      // ← automatically included
  urlProperty: string
  headersProperty?: string
}
```

No changes needed to the type exports — Zod inference handles it.

### Similarly for StdioConfigStructure (optional, future)

The same pattern could be applied to `StdioConfigStructureSchema` if needed, adding a `typeValue` for stdio transports. This is NOT required for the current bug fix.

## Testing

1. **Unit tests**: Verify that each builder's `buildHttpConfig()` uses the config-driven `typeValue`
2. **Snapshot tests**: Verify generated configs match expected output for all clients
3. **Validation tests**: Verify `validateClientConfig()` accepts configs with the new field
4. **Backward compatibility**: Verify configs WITHOUT `typeValue` still work (field is optional)

## Downstream Consumer (Scio)

Once this change ships in a new version of `@gleanwork/mcp-config-schema` (and re-exported through `@gleanwork/mcp-config-glean`):

1. Bump `@gleanwork/mcp-config-glean` in `package.json`
2. In `mdmScriptTemplate.ts`, replace hardcoded type values with:
   ```typescript
   const typeValue = httpPropertyMapping?.typeValue ?? ''
   ```
3. Remove the hardcoded `"http"` / `"streamable_http"` strings from `generateConfigBlock()`

## Version Bump

This is a **minor** version bump (non-breaking, additive schema change):
- 4.1.1 → 4.2.0
