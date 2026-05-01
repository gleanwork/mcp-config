import { describe, it, expect } from 'vitest';
import { createGleanRegistry, createGleanHeaders, buildGleanServerUrl } from '../../src/index.js';

/**
 * Goose: commandBuilder client (no native CLI)
 * Uses { extensions: {...} } format instead of { mcpServers: {...} }
 */
describe('Client: goose', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('goose');

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
            "extensions": {
              "glean_default": {
                "available_tools": [],
                "bundled": null,
                "description": "",
                "enabled": true,
                "env_keys": [],
                "envs": {},
                "headers": {
                  "Authorization": "Bearer my-api-token",
                },
                "name": "glean_default",
                "timeout": 300,
                "type": "streamable_http",
                "uri": "https://my-company-be.glean.com/mcp/default",
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
            "extensions": {
              "glean_default": {
                "available_tools": [],
                "bundled": null,
                "description": "",
                "enabled": true,
                "env_keys": [],
                "envs": {},
                "headers": {},
                "name": "glean_default",
                "timeout": 300,
                "type": "streamable_http",
                "uri": "https://my-company-be.glean.com/mcp/default",
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
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client goose --token my-api-token"`
        );
      });

      it('with OAuth (URL only, no token)', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).toMatchInlineSnapshot(
          `"npx -y @gleanwork/configure-mcp-server remote --url https://my-company-be.glean.com/mcp/default --client goose"`
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
