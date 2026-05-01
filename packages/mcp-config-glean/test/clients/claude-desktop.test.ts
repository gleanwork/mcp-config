import { describe, it, expect } from 'vitest';
import { createGleanRegistry, createGleanHeaders, buildGleanServerUrl } from '../../src/index.js';

/**
 * Claude Desktop: commandBuilder client (no native CLI)
 * Uses mcp-remote bridge for HTTP transport
 */
describe('Client: claude-desktop', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('claude-desktop');

  describe('buildConfiguration', () => {
    describe('http transport (uses mcp-remote bridge)', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(config).toMatchInlineSnapshot(`
          {
            "mcpServers": {
              "glean_default": {
                "args": [
                  "-y",
                  "mcp-remote",
                  "https://my-company-be.glean.com/mcp/default",
                  "--header",
                  "Authorization: Bearer my-api-token",
                ],
                "command": "npx",
                "type": "stdio",
              },
            },
          }
        `);
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toMatchInlineSnapshot(`
          {
            "mcpServers": {
              "glean_default": {
                "args": [
                  "-y",
                  "mcp-remote",
                  "https://my-company-be.glean.com/mcp/default",
                ],
                "command": "npx",
                "type": "stdio",
              },
            },
          }
        `);
      });
    });
  });

  describe('buildCommand', () => {
    describe('http transport', () => {
      it('with token auth', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(command).toMatchInlineSnapshot(
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client claude-desktop --token my-api-token"`
        );
      });

      it('with OAuth (URL only, no token)', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).toMatchInlineSnapshot(
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client claude-desktop"`
        );
      });
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns status', () => {
      const status = builder.supportsCliInstallation();
      expect(status).toMatchInlineSnapshot(`
        {
          "reason": "command_builder",
          "supported": true,
        }
      `);
    });
  });
});
