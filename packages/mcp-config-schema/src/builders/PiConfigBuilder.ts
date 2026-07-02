import { GenericConfigBuilder } from './GenericConfigBuilder.js';
import { MCPConnectionOptions } from '../types.js';

/**
 * Config builder for Pi which uses url/headers for bearer auth and
 * an explicit auth field for OAuth flows.
 */
export class PiConfigBuilder extends GenericConfigBuilder {
  protected buildHttpConfig(
    options: MCPConnectionOptions,
    includeRootObject: boolean = true
  ): Record<string, unknown> {
    const config = super.buildHttpConfig(options, includeRootObject);
    const headers = this.buildHeaders(options);

    const serversPropertyName = this.config.configStructure.serversPropertyName;
    const servers = (config[serversPropertyName] ?? config) as Record<
      string,
      Record<string, unknown>
    >;

    for (const serverConfig of Object.values(servers)) {
      if (headers) {
        serverConfig.auth = 'bearer';
      } else {
        serverConfig.auth = 'oauth';
      }
    }

    return config;
  }
}
