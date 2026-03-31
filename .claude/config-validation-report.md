# MCP Client Configuration Validation Report

**Date:** 2026-03-31
**Validated against:** Official documentation for each client

## Summary

| # | Client | Config File | Status | Notes |
|---|--------|-------------|--------|-------|
| 1 | ChatGPT | `chatgpt.json` | VALID | Web-only, not user-configurable |
| 2 | Claude Desktop | `claude-desktop.json` | VALID | Paths and properties match docs |
| 3 | Claude Teams/Enterprise | `claude-teams-enterprise.json` | VALID | Admin-managed, not user-configurable |
| 4 | Codex | `codex.json` | VALID | TOML format, `http_headers`, `mcp_servers` confirmed |
| 5 | Gemini CLI | `gemini.json` | VALID | `httpUrl` for streamable HTTP confirmed |
| 6 | Windsurf | `windsurf.json` | VALID | `serverUrl` property confirmed |
| 7 | Antigravity | `antigravity.json` | VALID | Limited docs (UI-focused), config path confirmed |
| 8 | Claude Code | `claude-code.json` | VALID | Paths, `mcpServers`, `type`+`url` confirmed |
| 9 | Cursor | `cursor.json` | VALID | Protocol handler, properties match |
| 10 | Cursor Agent | `cursor-agent.json` | VALID | Same config path as Cursor, different OAuth patterns |
| 11 | JetBrains AI Assistant | `jetbrains.json` | VALID | UI-based config, properties match |
| 12 | VS Code | `vscode.json` | VALID | `servers` (not `mcpServers`) confirmed |
| 13 | Goose | `goose.json` | VALID | YAML, `extensions`, `cmd`, `envs`, `uri` confirmed |
| 14 | OpenCode | `opencode.json` | VALID | Combined `command` array, custom builder handles it |
| 15 | Junie | `junie.json` | **FIXED** | Updated: now supports native HTTP transport |

**Result: 14 VALID, 1 FIXED**

---

## Issue Fixed: Junie

**Problem:** Config had `transports: ["stdio"]` marking Junie as stdio-only, requiring mcp-remote bridge for HTTP. Official Junie docs now show native HTTP support with `url` + `headers` properties.

**Documentation source:** https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html

**Changes made:**
- `junie.json`: Updated transports to `["stdio", "http"]`, added `httpPropertyMapping`, updated documentation URL, added `supportedAuth: ["token"]`
- `schemas.ts`: Made `type` optional in `HttpServerConfigSchema` (Junie HTTP configs don't include a type discriminator)
- Updated test snapshots in `builder.test.ts`, `registry.test.ts`, and `junie.test.ts`
- Regenerated `CLIENTS.md` and example configs

---

## Detailed Validation Notes

### ChatGPT
- Web-based, no local config — `userConfigurable: false` correct
- Supports SSE and Streamable HTTP via API
- OAuth DCR redirect URIs match OpenAI connector platform

### Claude Desktop
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json` — confirmed
- Windows: `%APPDATA%\Claude\claude_desktop_config.json` — confirmed
- Stdio-only natively, HTTP via mcp-remote — correct

### Codex
- TOML format at `~/.codex/config.toml` — confirmed
- `[mcp_servers.<name>]` tables — matches `serversPropertyName: "mcp_servers"`
- HTTP: `url` + `http_headers` — confirmed
- Stdio: `command`, `args`, `env` — confirmed

### Gemini CLI
- `~/.gemini/settings.json` — confirmed
- `httpUrl` for Streamable HTTP, `url` for SSE — confirmed
- `mcpServers` container, `headers` — confirmed

### Windsurf
- `~/.codeium/windsurf/mcp_config.json` — confirmed
- `serverUrl` for HTTP — confirmed
- `mcpServers` container — confirmed

### Claude Code
- `~/.claude.json` — confirmed
- HTTP: `type: "http"`, `url`, `headers` — confirmed
- Stdio: `type: "stdio"`, `command`, `args`, `env` — confirmed

### Cursor & Cursor Agent
- `~/.cursor/mcp.json` — confirmed
- `mcpServers`, `type: "http"`, `url`, `headers` — confirmed
- Protocol handler `cursor://anysphere.cursor-deeplink/mcp/install?...` — confirmed

### JetBrains AI Assistant
- UI-based config (Settings > Tools > AI Assistant > MCP) — confirmed
- Properties: `type`, `command`, `args`, `env`, `url`, `headers` — confirmed

### VS Code
- macOS: `~/Library/Application Support/Code/User/mcp.json` — confirmed
- Container: `servers` (not `mcpServers`) — confirmed
- HTTP: `type: "http"`, `url`, `headers` — confirmed

### Goose
- `~/.config/goose/config.yaml` — confirmed
- YAML format, `extensions` container — confirmed
- Stdio: `cmd`, `args`, `envs` — confirmed
- HTTP: `type: "streamable_http"`, `uri` — confirmed

### OpenCode
- `~/.config/opencode/opencode.json` — confirmed
- `mcp` container — confirmed
- Local: `type: "local"`, `command: [...]` (combined array) — confirmed
- Remote: `type: "remote"`, `url` — confirmed
- `environment` (not `env`) — confirmed
