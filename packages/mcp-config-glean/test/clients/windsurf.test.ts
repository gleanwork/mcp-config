import { describe, it, expect } from 'vitest';
import { createGleanRegistry, createGleanHeaders, buildGleanServerUrl } from '../../src/index.js';

/**
 * Windsurf: commandBuilder client (no native CLI)
 * Uses serverUrl instead of url for HTTP transport
 */
describe('Client: windsurf', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('windsurf');

  describe('buildConfiguration', () => {
    describe('http transport', () => {
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
                "headers": {
                  "Authorization": "Bearer my-api-token",
                },
                "serverUrl": "https://my-company-be.glean.com/mcp/default",
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
                "serverUrl": "https://my-company-be.glean.com/mcp/default",
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
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client windsurf --token my-api-token"`
        );
      });

      it('with OAuth (URL only, no token)', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).toMatchInlineSnapshot(
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client windsurf"`
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
