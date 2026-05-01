import { describe, it, expect } from 'vitest';
import { createGleanRegistry, createGleanHeaders, buildGleanServerUrl } from '../../src/index.js';

/**
 * VS Code: native CLI client
 * Has native `code --add-mcp` command - uses schema's native command generation
 */
describe('Client: vscode', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('vscode');

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
            "servers": {
              "glean_default": {
                "headers": {
                  "Authorization": "Bearer my-api-token",
                },
                "type": "http",
                "url": "https://my-company-be.glean.com/mcp/default",
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
            "servers": {
              "glean_default": {
                "type": "http",
                "url": "https://my-company-be.glean.com/mcp/default",
              },
            },
          }
        `);
      });
    });
  });

  describe('buildCommand (native CLI)', () => {
    describe('http transport', () => {
      it('with token auth', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(command).toMatchInlineSnapshot(
          `"code --add-mcp '{"name":"glean_default","type":"http","url":"https://my-company-be.glean.com/mcp/default","headers":{"Authorization":"Bearer my-api-token"}}'"`
        );
      });

      it('with OAuth (URL only, no token)', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).toMatchInlineSnapshot(
          `"code --add-mcp '{"name":"glean_default","type":"http","url":"https://my-company-be.glean.com/mcp/default"}'"`
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
