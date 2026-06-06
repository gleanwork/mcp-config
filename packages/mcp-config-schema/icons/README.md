# Client host icons

One SVG per MCP client, named to match the client `id` in `configs/`
(e.g. `cursor.svg` <-> `cursor.json`). Consumed two ways:

- **Inline strings** - `import { CLIENT_ICONS, getClientIcon } from '@gleanwork/mcp-config-schema'`.
  `getClientIcon(id)` returns the SVG markup (or `undefined`). No bundler/loader
  setup needed.
- **Raw files** - this directory ships in the published package for consumers
  that prefer to reference a file path.

`src/icons.generated.ts` is generated from these files. The generator strips the
XML prolog, drops the root `width`/`height` (so icons scale to their container
via `viewBox`), and namespaces internal ids (mask/clip/gradient/filter) per icon
so several icons can be inlined on one page without colliding.

## Adding or updating an icon

1. Drop `icons/<id>.svg` (filename must equal the client `id`). Prefer a square,
   icon-style mark (not a wordmark). Icons are optional - a client with no file
   is simply omitted from the manifest.
2. Run `npm run generate:icons`.

`test/icons-generated.test.ts` fails if an icon has no matching config or the
manifest is stale.

## Sources & trademarks

Icons are sourced from [svgl](https://svgl.app), [Simple Icons](https://simpleicons.org)
(icon files are CC0), and official brand assets. All product names and logos are
trademarks of their respective owners and are included only to identify the host
applications this package supports (nominative use); inclusion does not imply
endorsement or affiliation. Icons are unmodified except for the structural
normalization described above. Some marks are single-color by brand design
(e.g. OpenAI, Cursor, Claude); others are full-color (e.g. Gemini, VS Code,
JetBrains, Antigravity).
