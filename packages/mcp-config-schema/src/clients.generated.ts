/**
 * AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated from configs/*.json by scripts/generate-clients.ts.
 * Run `npm run generate:clients` to regenerate after adding or editing a client.
 */
import antigravityCliConfig from '../configs/antigravity-cli.json';
import antigravityConfig from '../configs/antigravity.json';
import chatgptConfig from '../configs/chatgpt.json';
import claudeCodeConfig from '../configs/claude-code.json';
import claudeDesktopConfig from '../configs/claude-desktop.json';
import claudeTeamsEnterpriseConfig from '../configs/claude-teams-enterprise.json';
import codexConfig from '../configs/codex.json';
import cursorAgentConfig from '../configs/cursor-agent.json';
import cursorConfig from '../configs/cursor.json';
import geminiConfig from '../configs/gemini.json';
import gooseConfig from '../configs/goose.json';
import jetbrainsConfig from '../configs/jetbrains.json';
import junieConfig from '../configs/junie.json';
import opencodeConfig from '../configs/opencode.json';
import vscodeConfig from '../configs/vscode.json';
import windsurfConfig from '../configs/windsurf.json';

/** Canonical client IDs, keyed by constant name. */
export const CLIENT = {
  ANTIGRAVITY_CLI: 'antigravity-cli',
  ANTIGRAVITY: 'antigravity',
  CHATGPT: 'chatgpt',
  CLAUDE_CODE: 'claude-code',
  CLAUDE_DESKTOP: 'claude-desktop',
  CLAUDE_TEAMS_ENTERPRISE: 'claude-teams-enterprise',
  CODEX: 'codex',
  CURSOR_AGENT: 'cursor-agent',
  CURSOR: 'cursor',
  GEMINI: 'gemini',
  GOOSE: 'goose',
  JETBRAINS: 'jetbrains',
  JUNIE: 'junie',
  OPENCODE: 'opencode',
  VSCODE: 'vscode',
  WINDSURF: 'windsurf',
} as const;

/** Display names, keyed by the same constant name as {@link CLIENT}. */
export const CLIENT_DISPLAY_NAME = {
  ANTIGRAVITY_CLI: 'Antigravity CLI',
  ANTIGRAVITY: 'Antigravity',
  CHATGPT: 'ChatGPT',
  CLAUDE_CODE: 'Claude Code',
  CLAUDE_DESKTOP: 'Claude for Desktop',
  CLAUDE_TEAMS_ENTERPRISE: 'Claude for Teams/Enterprise',
  CODEX: 'Codex',
  CURSOR_AGENT: 'Cursor Agent',
  CURSOR: 'Cursor',
  GEMINI: 'Gemini CLI',
  GOOSE: 'Goose',
  JETBRAINS: 'JetBrains AI Assistant',
  JUNIE: 'Junie (JetBrains)',
  OPENCODE: 'OpenCode',
  VSCODE: 'VS Code',
  WINDSURF: 'Windsurf',
} as const;

/** Display names keyed by client id (used by getDisplayName). */
export const DISPLAY_NAME_BY_ID = {
  'antigravity-cli': 'Antigravity CLI',
  antigravity: 'Antigravity',
  chatgpt: 'ChatGPT',
  'claude-code': 'Claude Code',
  'claude-desktop': 'Claude for Desktop',
  'claude-teams-enterprise': 'Claude for Teams/Enterprise',
  codex: 'Codex',
  'cursor-agent': 'Cursor Agent',
  cursor: 'Cursor',
  gemini: 'Gemini CLI',
  goose: 'Goose',
  jetbrains: 'JetBrains AI Assistant',
  junie: 'Junie (JetBrains)',
  opencode: 'OpenCode',
  vscode: 'VS Code',
  windsurf: 'Windsurf',
} as const;

/** All client ids as a literal tuple — the source for ClientIdSchema. */
export const CLIENT_IDS = [
  'antigravity-cli',
  'antigravity',
  'chatgpt',
  'claude-code',
  'claude-desktop',
  'claude-teams-enterprise',
  'codex',
  'cursor-agent',
  'cursor',
  'gemini',
  'goose',
  'jetbrains',
  'junie',
  'opencode',
  'vscode',
  'windsurf',
] as const;

/** Every client config, in id order. */
export const allClientConfigs = [
  antigravityCliConfig,
  antigravityConfig,
  chatgptConfig,
  claudeCodeConfig,
  claudeDesktopConfig,
  claudeTeamsEnterpriseConfig,
  codexConfig,
  cursorAgentConfig,
  cursorConfig,
  geminiConfig,
  gooseConfig,
  jetbrainsConfig,
  junieConfig,
  opencodeConfig,
  vscodeConfig,
  windsurfConfig,
];
