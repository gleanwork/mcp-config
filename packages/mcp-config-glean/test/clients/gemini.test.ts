import { describe, it, expect } from 'vitest';
import { createGleanRegistry, createGleanHeaders, buildGleanServerUrl } from '../../src/index.js';

/**
 * Gemini: Native CLI client
 * Uses httpUrl instead of url for HTTP transport
 * Uses native `gemini mcp add` command for installation
 */
describe('Client: gemini', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('gemini');

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
                "httpUrl": "https://my-company-be.glean.com/mcp/default",
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
                "httpUrl": "https://my-company-be.glean.com/mcp/default",
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
          `"gemini mcp add --transport http -H "Authorization: Bearer my-api-token" glean_default https://my-company-be.glean.com/mcp/default"`
        );
      });

      it('with OAuth (URL only, no token)', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).toMatchInlineSnapshot(
          `"gemini mcp add --transport http glean_default https://my-company-be.glean.com/mcp/default"`
        );
      });
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns status', () => {
      const status = builder.supportsCliInstallation();
      expect(status).toMatchInlineSnapshot(`
        {
          "reason": "native_cli",
          "supported": true,
        }
      `);
    });
  });
});
