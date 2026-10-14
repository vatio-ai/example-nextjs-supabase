# Agents

## Vatio

This directory is a Vatio workspace (`vatio.yml`). `vatio docs` prints the
contract for the manifest, tools, knowledge and the CLI; read it before
changing anything here.

To fix what supervisors reported in the inbox, take every open report in
one session: `vatio flags` (follow the instructions at the top of its
output), fix, `vatio push`, `vatio test` until the reports pass, then
`vatio publish`. The `vatio-improve` skill walks through it.
`vatio tools --env live` shows how each tool's backend has been answering:
error rate, timeouts, latency and the calls that failed.

## This example

- `vatio` is `npx @vatio-ai/cli@latest` when it is not installed globally.
- `tools/my_orders.yml` reads Supabase as the visitor (`Bearer $auth.token`),
  so Row Level Security in `supabase/migrations/` decides what the agent sees.
  Never give a tool the service-role key, and never a user id parameter.
- `vatio push` does not deploy knowledge. The entry in
  `kb/policies/shipping-and-returns.md` goes up with
  `vatio kb write policies shipping-and-returns kb/policies/shipping-and-returns.md`.
  Keep Markdown out of a top-level `knowledge/` directory: push refuses it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
