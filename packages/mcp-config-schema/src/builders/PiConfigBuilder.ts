import { GenericConfigBuilder } from './GenericConfigBuilder.js';
import { MCPConnectionOptions } from '../types.js';

/**
 * Quote a command argument for POSIX shells, like Python's `shlex.quote`.
 * Arguments that contain only safe characters are returned unchanged.
 *
 * Single quotes also keep `${VAR}` references literal, so Pi stores the
 * reference and resolves it at runtime instead of the shell expanding it.
 */
function shellQuote(value: string): string {
  if (value === '') {
    return "''";
  }
  if (/^[\w@%+=:,./-]+$/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * Config builder for Pi, which uses the standard { mcpServers: {...} } format
 * and installs servers with its native `pi mcp add` command.
 *
 * `pi mcp add` writes to the user-level ~/.pi/agent/mcp.json by default.
 */
export class PiConfigBuilder extends GenericConfigBuilder {
  protected get hasNativeCliSupport(): boolean {
    return true;
  }

  protected buildHttpCommand(options: MCPConnectionOptions): string {
    if (!options.serverUrl) {
      throw new Error('HTTP transport requires a server URL');
    }

    const resolvedUrl = this.substituteUrlVariables(options.serverUrl, options.urlVariables);

    const serverName = this.buildServerName({
      transport: options.transport,
      serverUrl: options.serverUrl,
      serverName: options.serverName,
    });

    // Format: pi mcp add <server> --url <url> --header KEY=VALUE
    let command = `pi mcp add ${serverName} --url ${shellQuote(resolvedUrl)}`;

    const headers = this.buildHeaders(options);
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        command += ` --header ${shellQuote(`${key}=${value}`)}`;
      }
    }

    return command;
  }

  protected buildStdioCommand(options: MCPConnectionOptions): string {
    const serverName = this.buildServerName({
      transport: 'stdio',
      serverName: options.serverName,
    });

    // Format: pi mcp add <server> --env KEY=VALUE -- <command> [args...]
    let command = `pi mcp add ${serverName}`;

    const env = this.getEnvVars(options);
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        command += ` --env ${shellQuote(`${key}=${value}`)}`;
      }
    }

    command += ` -- npx -y ${this.serverPackage}`;

    return command;
  }
}
