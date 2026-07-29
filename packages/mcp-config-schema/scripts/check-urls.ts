#!/usr/bin/env node
/**
 * Verify that every `documentationUrl` in the client configs actually resolves.
 * Run via `npm run check:urls`.
 */

import { MCPConfigRegistry } from '../src/registry.js';

const TIMEOUT_MS = 10_000;

interface UrlCheck {
  url: string;
  clientIds: string[];
}

interface CheckResult extends UrlCheck {
  ok: boolean;
  detail: string;
}

function collectUrlChecks(): UrlCheck[] {
  const registry = new MCPConfigRegistry();
  const clientIdsByUrl = new Map<string, string[]>();

  for (const client of registry.getAllConfigs()) {
    if (!client.documentationUrl) continue;
    const clientIds = clientIdsByUrl.get(client.documentationUrl) ?? [];
    clientIds.push(client.id);
    clientIdsByUrl.set(client.documentationUrl, clientIds);
  }

  return Array.from(clientIdsByUrl, ([url, clientIds]) => ({ url, clientIds }));
}

async function fetchStatus(url: string, method: 'HEAD' | 'GET'): Promise<number> {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return response.status;
}

/** Some servers reject HEAD (405/501) or drop it entirely; retry with GET before giving up. */
async function checkUrl({ url, clientIds }: UrlCheck): Promise<CheckResult> {
  let lastError: unknown;

  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const status = await fetchStatus(url, method);
      if (method === 'HEAD' && (status === 405 || status === 501)) {
        continue;
      }
      return { url, clientIds, ok: status < 400, detail: `HTTP ${status}` };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    url,
    clientIds,
    ok: false,
    detail: lastError instanceof Error ? lastError.message : String(lastError),
  };
}

async function main() {
  const checks = collectUrlChecks();
  console.log(`Checking ${checks.length} documentation URL(s)...\n`);

  const results = await Promise.all(checks.map(checkUrl));

  for (const result of results) {
    const icon = result.ok ? '✅' : '❌';
    console.log(
      `${icon} ${result.url} — ${result.detail} (used by: ${result.clientIds.join(', ')})`
    );
  }

  const failures = results.filter((result) => !result.ok);
  console.log('');
  if (failures.length > 0) {
    console.error(`${failures.length} of ${results.length} documentation URL(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`All ${results.length} documentation URL(s) are reachable.`);
  }
}

main();
