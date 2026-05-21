<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Confirmed Next.js 16 changes (so we don't relearn them every session)

- **`middleware.ts` → `proxy.ts`**. File at project root, exports a `proxy()` function (default or named). Same matcher/config shape.
- **`cookies()`, `headers()`, `params`, `searchParams` are async** — must `await`.
- **Prisma 7 datasource `url` is no longer allowed in `schema.prisma`** — it lives in `prisma.config.ts`. Use `@prisma/adapter-pg` driver adapter pattern.
- **Prisma 7 `prisma migrate diff`** flag is `--to-schema` (not `--to-schema-datamodel`).
- **Prisma 7 has agent-safety gates** on destructive commands (`migrate reset`) — requires `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var carrying the user's literal consent message.
- **shadcn `base-nova` preset Button** uses `@base-ui/react/button`, **not** Radix Slot. There is no `asChild` prop. To style a `<Link>` as a button, use `buttonVariants()` + `cn()` directly on the Link.
- **shadcn `base-nova` Dialog/AlertDialog/DropdownMenu triggers** use `render={<Button />}` (base-ui pattern), not `asChild`. The trigger's children become the rendered Button's children.
- **Prisma 7 generated model types** are named `<Model>Model` (e.g. `NotebookModel`), not bare `Notebook`. Import from `@/generated/prisma/models`. The `Notebook` symbol itself doesn't exist.
<!-- END:nextjs-agent-rules -->

# Project: NoteMind

NotebookLM-style RAG app. Users create notebooks, upload documents (PDF/DOCX/TXT), and chat with an AI that only answers from those documents. Strict context-grounded answers, sliding-window conversation memory.

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| UI | Tailwind v4 + shadcn/ui (preset `base-nova`, baseColor `neutral`) |
| Icons | lucide-react |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| DB + Storage + Auth | Supabase (Postgres + pgvector) |
| Embeddings (planned) | Hugging Face `all-MiniLM-L6-v2` (384 dims) |
| RAG (planned) | LangChain.js |
| LLM (planned) | Hugging Face Mistral or Claude API — TBD |
| File parsing (planned) | `pdf-parse`, `mammoth` |

## Folder conventions (enforce these)

- **`hooks/`** — all React hooks (e.g. `hooks/use-notebook.ts`). No hooks scattered inside `app/` or `components/`.
- **`types/`** — all shared TypeScript types (e.g. `types/notebook.ts`). No `types.ts` next to components.
- **`lib/`** — clients, utilities, integrations (Supabase, Prisma, helpers).
- **`app/`** — routes only: pages, layouts, route handlers, server actions.
- **`components/`** — UI components. `components/ui/` reserved for shadcn primitives.

## Build cadence

Built **one step at a time under user guidance**. Do not batch multiple steps without confirmation. After each phase finishes, update the Project Status section below.

## Design system (locked in Phase 1)

- **Pattern**: Minimal Single Column (centered card auth, single-column layouts)
- **Style**: Flat Design — no gradients, no heavy shadows, clean lines
- **Color**: shadcn `neutral` grayscale base + **teal-600 / teal-400 brand accent** used sparingly (brand mark icon, secondary links). Quiet, not loud.
- **Typography**: Geist Sans + Geist Mono (already wired in `app/layout.tsx`)
- **Tagline**: *"Notes that answer back."*
- **Brand mark**: `<BrandMark>` component at `components/brand-mark.tsx` — Lucide `NotebookPen` icon + "NoteMind" wordmark
- **Dark mode**: via shadcn CSS variables; brand accent has light/dark variants

## Forms

- Native `<form action={serverAction}>` with shadcn `Input` / `Label` / `Button`.
- **No react-hook-form, no Zod-resolver, no client form state.** Server Actions own validation and redirect on error.
- Pending state: `useFormStatus()` inside a small client `SubmitButton` (`components/auth/submit-button.tsx`).

## Project Status

### ✅ Phase 1 — Foundation (complete)

**Database & ORM**
- Prisma 7 with `@prisma/adapter-pg` driver adapter (`lib/prisma.ts`)
- `prisma.config.ts` holds the `DATABASE_URL` (Prisma 7 no longer reads it from the schema)
- Models: `Notebook`, `Document`, `Chunk` (with `Unsupported("vector(384)")` embedding), `Message`, `Summary` — all with cascade FKs
- pgvector + Supabase-managed extensions (`pgcrypto`, `pg_stat_statements`, `uuid-ossp`, `supabase_vault`) declared in schema
- Baseline migration: `prisma/migrations/20260521000000_init` (created via `db push` + `migrate diff` + `migrate resolve --applied` because Supabase pre-installed extensions cause drift on fresh `migrate dev`)
- Going forward, normal `npx prisma migrate dev --name <change>` will work

**Auth**
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)
- Session refresh: `lib/supabase/proxy.ts` (logic) + `proxy.ts` at root (Next.js 16 entry point + matcher)
- **The `getUser()` call inside `updateSession` is load-bearing** — do not remove
- Server actions: `app/actions/auth.ts` (`login`, `signup`, `logout`)
- Pages: `app/(auth)/login`, `app/(auth)/signup`, `app/(auth)/error` (route group, shared centered layout)
- Email-confirm flow: `app/auth/callback/route.ts` exchanges the code for a session
- Protected home: `app/page.tsx` redirects to `/login` if `auth.getUser()` returns no user

**UI**
- shadcn initialized (preset `base-nova`, baseColor `neutral`, CSS variables, lucide icons)
- Installed components: `Button`, `Input`, `Label`, `Card` (in `components/ui/`)
- `BrandMark` component, `SubmitButton` client component

**Supabase dashboard config required for the email-confirm flow:**
- Auth → URL Configuration → Site URL = `http://localhost:3000`
- Redirect URLs include `http://localhost:3000/auth/callback`

### ✅ Phase 2 — Notebooks (complete)

**Data layer**
- `lib/auth.ts` — `getUser()` / `requireUser()` (use `requireUser` in every protected page/action)
- `app/actions/notebooks.ts` — `createNotebook`, `deleteNotebook`. Ownership check baked into `deleteMany({ where: { id, userId } })` — single atomic query, no existence leak. Cascade FKs handle child cleanup.

**Dashboard (`app/page.tsx`)**
- Server component, fetches notebooks for the user with `_count.documents`, orders by `updatedAt desc`
- Empty state vs responsive card grid (1/2/3 cols at base/sm/lg)
- `components/app-header.tsx` — brand + email + sign-out, reused on detail page
- `components/notebook/notebook-card.tsx` — title link, doc count, relative time, `⋯` menu
- `components/notebook/notebook-card-menu.tsx` (client) — dropdown + AlertDialog confirm for delete
- `components/notebook/new-notebook-dialog.tsx` (client) — Dialog with title input, `useFormStatus` submit feedback
- `lib/format.ts` — `formatRelativeTime()` using `Intl.RelativeTimeFormat` (no deps)
- `types/notebook.ts` — `NotebookListItem = NotebookModel & { _count: { documents: number } }`

**Notebook detail (`app/notebooks/[id]/page.tsx`)**
- Owner-scoped `findFirst({ where: { id, userId } })` → `notFound()` if missing
- Two-pane shell: left Documents (Phase 3 placeholder), right Chat (Phase 4 placeholder)
- `app/notebooks/[id]/not-found.tsx` — friendly 404 that doesn't leak existence vs. access

### Up next

**Phase 3 — Document Upload & Ingestion**: file upload UI → Supabase Storage, parse PDF/DOCX/TXT, LangChain `RecursiveCharacterTextSplitter` for chunking, Hugging Face embeddings → `chunks` table, document list in notebook detail.
