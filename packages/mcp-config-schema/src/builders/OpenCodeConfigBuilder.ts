import { BaseConfigBuilder } from './BaseConfigBuilder.js';
import { MCPConnectionOptions, OpenCodeMCPConfig, MCPServersRecord } from '../types.js';

function isOpenCodeMCPConfig(
  config: OpenCodeMCPConfig | MCPServersRecord
): config is OpenCodeMCPConfig {
  return typeof config === 'object' && config !== null && 'mcp' in config;
}

/**
 * Config builder for OpenCode which uses { mcp: {...} } format
 * with "local"/"remote" type values and combined command arrays.
 */
export class OpenCodeConfigBuilder extends BaseConfigBuilder<OpenCodeMCPConfig> {
  protected buildStdioConfig(
    options: MCPConnectionOptions,
    includeRootObject: boolean = true
  ): Record<string, unknown> {
    const serverName = this.buildServerName({
      transport: 'stdio',
      serverName: options.serverName,
    });

    const serverConfig: Record<string, unknown> = {
      type: 'local',
      command: ['npx', '-y', this.serverPackage],
    };

    const env = this.getEnvVars(options);
    if (env) {
      serverConfig.environment = env;
    }

    if (!includeRootObject) {
      return {
        [serverName]: serverConfig,
      };
    }

    return {
      mcp: {
        [serverName]: serverConfig,
      },
    };
  }

  protected buildHttpConfig(
    options: MCPConnectionOptions,
    includeRootObject: boolean = true
  ): Record<string, unknown> {
    if (!options.serverUrl) {
      throw new Error('HTTP transport requires a server URL');
    }

    const resolvedUrl = this.substituteUrlVariables(options.serverUrl, options.urlVariables);

    const serverName = this.buildServerName({
      transport: 'http',
      serverUrl: options.serverUrl,
      serverName: options.serverName,
    });

    if (this.config.transports.includes('http')) {
      const serverConfig: Record<string, unknown> = {
        type: 'remote',
        url: resolvedUrl,
      };

      const headers = this.buildHeaders(options);
      if (headers) {
        serverConfig.headers = headers;
      }

      if (!includeRootObject) {
        return {
          [serverName]: serverConfig,
        };
      }

      return {
        mcp: {
          [serverName]: serverConfig,
        },
      };
    } else {
      throw new Error(`Client ${this.config.id} doesn't support HTTP server configuration`);
    }
  }

  protected buildHttpCommand(options: MCPConnectionOptions): string | null {
    if (this.commandBuilder?.http) {
      return this.commandBuilder.http(this.config.id, options);
    }

    return null;
  }

  protected buildStdioCommand(options: MCPConnectionOptions): string | null {
    if (this.commandBuilder?.stdio) {
      return this.commandBuilder.stdio(this.config.id, options);
    }

    return null;
  }

  /**
   * @deprecated This method is deprecated and will be removed in the next major version.
   *             Consumers should use buildConfiguration() directly and handle the output format
   *             based on the includeRootObject option.
   */
  getNormalizedServersConfig(config: OpenCodeMCPConfig | MCPServersRecord): MCPServersRecord {
    const servers: MCPServersRecord = isOpenCodeMCPConfig(config) ? config.mcp : config;

    const normalized: MCPServersRecord = {};

    for (const [name, value] of Object.entries(servers)) {
      const openCodeConfig = value as Record<string, unknown>;
      if (typeof openCodeConfig === 'object' && openCodeConfig !== null) {
        const commandArray = openCodeConfig.command as string[] | undefined;
        normalized[name] = {
          type: openCodeConfig.type === 'local' ? 'stdio' : 'http',
          command: commandArray?.[0],
          args: commandArray?.slice(1),
          env: openCodeConfig.environment,
          url: openCodeConfig.url,
          headers: openCodeConfig.headers,
        };
      }
    }

    return normalized;
  }
}
