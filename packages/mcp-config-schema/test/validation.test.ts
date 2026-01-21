import { describe, it, expect } from 'vitest';
import {
  safeValidateClientConfig,
  safeValidateServerConfig,
  validateServerConfig,
  SupportedAuthSchema,
  OAuthDcrSchema,
  OAuthSchema,
} from '../src/schemas';

describe('Zod Validation', () => {
  describe('Client Config Validation', () => {
    it('should validate a correct client config', () => {
      const validConfig = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test client',
        userConfigurable: true,
        transports: ['http'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: {
          darwin: '/test/path',
        },
        configStructure: {
          serversPropertyName: 'mcpServers',
          httpPropertyMapping: {
            urlProperty: 'url',
          },
        },
        supportedAuth: ['token'],
      };

      const result = safeValidateClientConfig(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid client ID', () => {
      const invalidConfig = {
        id: 'invalid-client',
        name: 'invalid',
        displayName: 'Invalid',
        description: 'Test',
        userConfigurable: true,

        transports: ['http'],

        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test' },
        configStructure: {
          serversPropertyName: 'servers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
      };

      const result = safeValidateClientConfig(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('should reject invalid local config support level', () => {
      const invalidConfig = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test',
        userConfigurable: 1234, // Invalid

        transports: ['http'],

        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test' },
        configStructure: {
          serversPropertyName: 'servers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
      };

      const result = safeValidateClientConfig(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['userConfigurable']);
        expect(result.error.issues[0].message).toContain('boolean');
      }
    });

    it('should validate optional documentation URL', () => {
      const configWithUrl = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test',
        userConfigurable: true,

        documentationUrl: 'https://docs.example.com',
        transports: ['http'],

        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test' },
        configStructure: {
          serversPropertyName: 'servers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
        supportedAuth: ['token'],
      };

      const result = safeValidateClientConfig(configWithUrl);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const configWithBadUrl = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test',
        userConfigurable: true,

        documentationUrl: 'not-a-url', // Invalid URL
        transports: ['http'],

        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test' },
        configStructure: {
          serversPropertyName: 'servers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
      };

      const result = safeValidateClientConfig(configWithBadUrl);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['documentationUrl']);
      }
    });
  });

  describe('Server Config Validation', () => {
    it('should validate remote server config', () => {
      const config = {
        transport: 'http',
        serverUrl: 'https://glean.com/mcp/default',
        serverName: 'glean',
      };

      const result = safeValidateServerConfig(config);
      expect(result.success).toBe(true);
    });

    it('should validate local server config', () => {
      const config = {
        transport: 'stdio',
        instance: 'my-company',
        apiToken: 'test-token',
      };

      const result = safeValidateServerConfig(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transport', () => {
      const config = {
        transport: 'hybrid' as unknown as 'stdio' | 'http', // Invalid transport for testing
        serverUrl: 'https://glean.com/mcp/default',
      };

      const result = safeValidateServerConfig(config);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['transport']);
      }
    });

    it('should accept any string as serverUrl including invalid URLs', () => {
      const config = {
        transport: 'http',
        serverUrl: 'not-a-url', // Now accepted as placeholder
      };

      const result = safeValidateServerConfig(config);
      expect(result.success).toBe(true);

      // Also test with placeholder URL
      const placeholderConfig = {
        transport: 'http',
        serverUrl: 'https://[instance]-be.glean.com/mcp/[endpoint]',
      };

      const placeholderResult = safeValidateServerConfig(placeholderConfig);
      expect(placeholderResult.success).toBe(true);
    });

    it('should throw on invalid config when using validateServerConfig', () => {
      const invalidConfig = {
        mode: 'invalid',
      };

      expect(() => validateServerConfig(invalidConfig)).toThrow();
    });
  });

  describe('Authentication Schema Validation', () => {
    it('should validate supported auth types', () => {
      expect(SupportedAuthSchema.safeParse('token').success).toBe(true);
      expect(SupportedAuthSchema.safeParse('oauth:dcr').success).toBe(true);
      expect(SupportedAuthSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate OAuth DCR schema with redirect patterns', () => {
      const validDcr = {
        redirect_uri_patterns: ['http://localhost:*/callback'],
      };
      expect(OAuthDcrSchema.safeParse(validDcr).success).toBe(true);

      const multiplePatterns = {
        redirect_uri_patterns: [
          'cursor://anysphere.cursor-mcp/oauth/callback',
          'cursor://anysphere.cursor-retrieval/oauth/*/callback',
        ],
      };
      expect(OAuthDcrSchema.safeParse(multiplePatterns).success).toBe(true);
    });

    it('should reject OAuth DCR with empty redirect patterns', () => {
      const emptyPatterns = {
        redirect_uri_patterns: [],
      };
      expect(OAuthDcrSchema.safeParse(emptyPatterns).success).toBe(false);
    });

    it('should validate OAuth schema with optional dcr', () => {
      const withDcr = {
        dcr: {
          redirect_uri_patterns: ['https://example.com/callback'],
        },
      };
      expect(OAuthSchema.safeParse(withDcr).success).toBe(true);

      const withoutDcr = {};
      expect(OAuthSchema.safeParse(withoutDcr).success).toBe(true);
    });

    it('should validate client config with supportedAuth', () => {
      const configWithAuth = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test client',
        userConfigurable: true,
        transports: ['http'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test/path' },
        configStructure: {
          serversPropertyName: 'mcpServers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
        supportedAuth: ['token', 'oauth:dcr'],
        oauth: {
          dcr: {
            redirect_uri_patterns: ['http://localhost:*/callback'],
          },
        },
      };

      const result = safeValidateClientConfig(configWithAuth);
      expect(result.success).toBe(true);
    });

    it('should validate client config with empty supportedAuth', () => {
      const configNoAuth = {
        id: 'claude-desktop',
        name: 'claude-desktop',
        displayName: 'Claude Desktop',
        description: 'Test client',
        userConfigurable: true,
        transports: ['stdio'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test/path' },
        configStructure: {
          serversPropertyName: 'mcpServers',
          stdioPropertyMapping: {
            commandProperty: 'command',
            argsProperty: 'args',
          },
        },
        supportedAuth: [],
      };

      const result = safeValidateClientConfig(configNoAuth);
      expect(result.success).toBe(true);
    });

    it('should validate client config with token-only auth', () => {
      const configTokenOnly = {
        id: 'jetbrains',
        name: 'jetbrains',
        displayName: 'JetBrains',
        description: 'Test client',
        userConfigurable: true,
        transports: ['http'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: {},
        configStructure: {
          serversPropertyName: 'mcpServers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
        supportedAuth: ['token'],
      };

      const result = safeValidateClientConfig(configTokenOnly);
      expect(result.success).toBe(true);
    });

    it('should reject client config with invalid supportedAuth value', () => {
      const configInvalidAuth = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test client',
        userConfigurable: true,
        transports: ['http'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test/path' },
        configStructure: {
          serversPropertyName: 'mcpServers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
        supportedAuth: ['invalid-auth-type'],
      };

      const result = safeValidateClientConfig(configInvalidAuth);
      expect(result.success).toBe(false);
    });

    it('should reject client config without supportedAuth', () => {
      const configMissingAuth = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'Test client',
        userConfigurable: true,
        transports: ['http'],
        supportedPlatforms: ['darwin'],
        configFormat: 'json',
        configPath: { darwin: '/test/path' },
        configStructure: {
          serversPropertyName: 'mcpServers',
          httpPropertyMapping: { urlProperty: 'url' },
        },
      };

      const result = safeValidateClientConfig(configMissingAuth);
      expect(result.success).toBe(false);
    });
  });
});
