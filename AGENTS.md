<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Confirmed Next.js 16 changes (so we don't relearn them every session)

- **`middleware.ts` → `proxy.ts`**. File at project root, exports a `proxy()` function (default or named). Same matcher/config shape.
- **`cookies()`, `headers()`, `params`, `searchParams` are async** — must `await`.
- **Prisma 7 datasource `url` is no longer allowed in `schema.prisma`** — it lives in `prisma.config.ts`. Use `@prisma/adapter-pg` driver adapter pattern.
- **Prisma 7 `prisma migrate diff`** flag is `--to-schema` (not `--to-schema-datamodel`).
<!-- END:nextjs-agent-rules -->

# Project conventions (NoteMind)

## Folder structure rules
- **`hooks/`** — all React hooks live here (e.g. `hooks/use-notebook.ts`). No hooks inside `app/` or `components/` folders.
- **`types/`** — all shared TypeScript type definitions live here (e.g. `types/notebook.ts`, `types/chunk.ts`). No `types.ts` files scattered next to components.
- **`lib/`** — utilities, clients (Supabase, Prisma), and integrations.
- **`app/`** — only routes, layouts, pages, route handlers, server actions.
- **`components/`** — presentational and stateful UI components only.

## Build cadence
- This project is built **one step at a time under user guidance**. Do not batch multiple steps without confirmation.
- After each phase from the build plan finishes, update this file with a `## Project Status` entry summarizing what's now in place.
