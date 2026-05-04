import { describe, it, expect } from 'vitest';
import { createGleanRegistry } from '../../src/index.js';

/**
 * Linear: web-based agent with no local config support
 * createBuilder() throws an error - MCP servers must be added via Linear's settings UI
 */
describe('Client: linear (web-based only)', () => {
  const registry = createGleanRegistry();

  describe('createBuilder', () => {
    it('throws error because Linear requires web UI configuration', () => {
      expect(() => registry.createBuilder('linear')).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot create builder for Linear: Linear Agent is web-based and requires adding MCP servers through the Linear settings UI. No local configuration file support.]`
      );
    });
  });
});
