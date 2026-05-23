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
- **`pdf-parse@2` has a new class API** (and is Next.js / Vercel friendly). Use `import { PDFParse } from "pdf-parse"`, then `new PDFParse({ data: bufferOrUint8Array })`, then `await parser.getText()` → `{ text, pages }`. **Do not** import from `pdf-parse/lib/pdf-parse.js` (that was the v1 workaround; the path no longer exists in v2). v2 ships its own types — don't install `@types/pdf-parse`.
- **`pdf-parse` + `pdfjs-dist` must be in `serverExternalPackages`** in `next.config.ts` (top-level, not under `experimental`). Without this Turbopack bundles them and pdfjs's worker (`pdf.worker.mjs`) can't be located at runtime → `Setting up fake worker failed` on every parse.
- **HuggingFace inference: do NOT hand-code `api-inference.huggingface.co`.** That subdomain was retired (DNS `ENOTFOUND`). Use the `@huggingface/inference` SDK (`InferenceClient`) — it handles routing through `router.huggingface.co` and works against the current "Inference Providers" system. Construct lazily at call time so missing `HUGGINGFACE_API_KEY` at boot doesn't crash the server.
- **HF free-tier chat is unreliable** (late 2025+). The `hf-inference` provider rejects most instruct models with either `'is not a chat model'` (no `conversational` tag) or `'not supported by any provider you have enabled'` (account-level provider config). After burning hours on this, **we use HF only for embeddings** (still works) and Google Gemini for chat.
- **Supabase + Prisma drift workaround (recurring)**: `prisma migrate dev` fails on every schema change because Supabase auto-manages its extensions independently. **Workflow for any schema change:**
  1. Edit `prisma/schema.prisma`
  2. `npx prisma db push` — applies the change directly to the DB
  3. Hand-write the migration SQL in a new folder `prisma/migrations/<timestamp>_<name>/migration.sql` (don't try `migrate diff --from-migrations` — it needs a shadow DB)
  4. `npx prisma migrate resolve --applied <timestamp>_<name>`
  5. `npx prisma generate`
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

### ✅ Phase 3 — Document Upload & Ingestion (complete)

**Schema + config**
- `Document.status` enum: `processing` | `ready` | `failed` (default `processing`)
- Migration: `prisma/migrations/20260521010000_document_status`
- `next.config.ts` — `experimental.serverActions.bodySizeLimit = "10mb"`. **Vercel Hobby caps serverless body at ~4.5MB** — if deploying there, drop this back or move to signed-URL direct upload.
- Deps: `pdf-parse`, `mammoth`, `@langchain/textsplitters`, `@types/pdf-parse`
- `types/pdf-parse.d.ts` — module declaration for `pdf-parse/lib/pdf-parse.js` (the inner path we import to avoid the test-PDF bug)

**Storage**
- `lib/storage.ts` — `uploadFileToStorage`, `downloadFileFromStorage`, `deleteFileFromStorage`
- Bucket: `STORAGE_BUCKET = "documents"` (private, in Supabase dashboard)
- Path scheme: `<userId>/<notebookId>/<documentId>-<safeFilename>`
- **RLS policies required** — see `supabase/storage_policies.sql`. Run once in the Supabase SQL Editor. Without these, every upload returns `new row violates row-level security policy`. The policies scope INSERT/SELECT/DELETE to files whose first path segment matches `auth.uid()`.

**Ingestion pipeline (`lib/`)**
- `parsing.ts` — `parseFile(buffer, mimeType)` dispatching to `pdf-parse` (inner path) / `mammoth` / native UTF-8. `SUPPORTED_MIME_TYPES`, `isSupportedMimeType()` guard.
- `chunking.ts` — `chunkText(text)`: `RecursiveCharacterTextSplitter` 800 chars / 100 overlap, whitespace-normalized.
- `embeddings.ts` — `embed(texts)` calls HF Inference API for `sentence-transformers/all-MiniLM-L6-v2`. Batches of 32, retries 503 cold-start with backoff, normalizes the 1D-vs-2D response quirk for single inputs.
- `ingest.ts` — orchestrator. Marks `failed` on any error before rethrowing. **Writes chunks via `$executeRaw` because `Chunk.embedding` is `Unsupported("vector(384)")` — Prisma can't write it through the typed client.** Pattern: `${vectorLiteral}::vector` (still parameterized, safe from injection).

**Server actions (`app/actions/documents.ts`)**
- `uploadDocument(formData)` — ownership check → file validation (10MB cap, MIME guard) → create Document row (status `processing`) → upload to Storage → update with path → `ingestDocument()` synchronously → revalidate + redirect. On any error: marks `status: "failed"`, still redirects.
- `deleteDocument(formData)` — ownership check via JOIN (`notebook.userId`) → best-effort storage delete → DB delete (cascade kills chunks).

**UI (`components/document/`)**
- `upload-dropzone.tsx` (client) — drag-drop + click, native `DataTransfer` binding to a hidden file input so the form submits the file naturally. `useFormStatus()` drives a `<DropzoneActions>` sub-component that disables Clear+Upload while pending.
- `document-list.tsx` (server) — divided list.
- `document-item.tsx` (server) — file icon, truncated name, chunk count (only when Ready), status pill, delete button.
- `delete-document-dialog.tsx` (client) — AlertDialog confirm.
- `documents-pane.tsx` (server) — assembles header + dropzone + list. Used by `app/notebooks/[id]/page.tsx`.
- `types/document.ts` — `DocumentListItem = DocumentModel & { _count: { chunks: number } }`.

**Performance ceiling to remember**
- Each upload is synchronous: parse → chunk → batch-embed via HF → INSERT-per-chunk. Big PDFs can take 10–30s. Acceptable for MVP. If we hit Vercel function timeouts (Hobby: 10s; Pro: 60s), move ingestion to `after()` (Next.js 16) or a background job runner.
- HF free tier rate-limits hard (~100s req/hr). Heavy use = switch to dedicated inference endpoint.

### ✅ Phase 4 — RAG Chat (complete)

**LLM**: `llama-3.3-70b-versatile` via Groq (`groq-sdk`). Free tier, no credit card. Env var: `GROQ_API_KEY` from https://console.groq.com/keys. (We tried HF Mistral/Nemo/Zephyr — none routed through the free chat endpoint. We then tried Google Gemini, but Gemini's free tier is unusable on any project that has billing enabled with no credits. Groq is the only no-strings-attached free path. Embeddings still use HF — that endpoint works fine.)

**Backend**
- `lib/vector-search.ts` — `findSimilarChunks({ notebookId, userId, queryEmbedding, k=5 })`. Raw SQL with cosine distance (`embedding <=> $::vector`). JOINs through Notebook so ownership is enforced **in the same query as the search** — no second roundtrip. Filters to `status = 'ready'` documents only.
- `lib/llm.ts` — `buildRagSystemPrompt(chunks)` produces the strict "answer only from this context" system prompt with numbered chunk references. `streamChatCompletion()` is an `async function*` yielding raw text strings.
- `app/api/chat/route.ts` — POST. Flow: auth → validate body → ownership check → require at least one Ready doc → **persist user message first** (survives downstream failures) → embed question → vector search → stream Mistral → persist assistant message in `finally` (saves whatever accumulated, even on error). Returns plain-text `ReadableStream`. `maxDuration = 60` to give HF cold-starts headroom.

**Chat UI (`components/chat/`)**
- `chat-pane.tsx` (server) — section + header + ChatThread wrapper, mirrors DocumentsPane shape
- `chat-thread.tsx` (client) — all stateful behavior. Holds message list, optimistic UI, stream reader, auto-scroll, focus management, Enter/Shift+Enter, animated `ThinkingDots`
- `message-bubble.tsx` — pure visual. User = right-aligned `bg-secondary` rounded bubble; assistant = left-aligned plain text body (NotebookLM-style)
- Textarea uses shadcn's `Textarea` which has native `field-sizing: content` for auto-resize — no JS

**Patterns worth remembering**
- **Plain-text streaming over JSON/SSE** for simplicity. Client reads `response.body.getReader()` + `TextDecoder({ stream: true })` to handle UTF-8 chars split across chunks.
- **Optimistic UI without `router.refresh()`** — append to local state on stream end, accept temp IDs until next page load swaps them with DB IDs. Prevents the flicker of optimistic→server reconciliation.
- **User msg persisted BEFORE embedding** so questions are never lost.
- **Assistant msg persisted in `finally`** so partial responses are kept too.
- **Ownership baked into the search SQL** via JOIN — defense in depth that closes the "malicious notebookId" attack at the data layer.

### ✅ Phase 5 — Conversation Memory (complete)

**Sliding window**
- `RECENT_WINDOW_SIZE = 10` exported from `lib/llm.ts`. The chat route pulls the last 10 messages newer than the summary cutoff (oldest-first) and passes them as `history: ChatTurn[]` to `streamChatCompletion`.
- `streamChatCompletion` signature changed: `history: ChatTurn[]` instead of `userMessage: string`. The just-persisted user message is the natural final turn of `history`.

**Summarization (`lib/summary.ts`)**
- `summarizeMessages(messages, previousSummary?)` — non-streaming Groq call, same `llama-3.3-70b-versatile` model. When `previousSummary` is passed, the system prompt asks the model to *extend or revise* the existing summary (3–5 bullets) rather than start from scratch. Cheap, incremental, no re-summarizing the same material every turn.
- `updateNotebookSummary(notebookId)` — orchestrator. Reads the existing `Summary` row, translates `upToMessageId` → `createdAt` cutoff, fetches all messages newer than the cutoff, folds everything **older than the recent window** into a new summary, upserts the `Summary` row with the new content and new `upToMessageId`. Self-gating: returns early if `newer.length <= RECENT_WINDOW_SIZE`.
- `SUMMARIZE_THRESHOLD = 20` exported from `lib/summary.ts`.

**Wiring (`app/api/chat/route.ts`)**
- After persisting the user message, loads `summary` + computes `cutoff` Date from `upToMessageId`.
- Recent-window fetch now has `createdAt: { gt: cutoff }` filter — summarized turns never replay.
- `streamChatCompletion` receives `previousSummary: summary?.content`. The LLM call injects `[Earlier in this conversation, summarized]: …` as a leading synthetic user turn ahead of the recent history.
- In the stream's `finally`, after the assistant message is persisted and the controller is closed, **`after()` from `next/server`** schedules `updateNotebookSummary(notebookId)` to run post-response. The user never waits on summarization.
- Trigger gate: only runs `updateNotebookSummary` if total message count > `SUMMARIZE_THRESHOLD`. The orchestrator self-gates again on whether there's actually material to fold in.

**Schema**: no migration needed — the `Summary` model (with `notebookId @unique` and `upToMessageId String?`) was added back in Phase 1.

**Patterns worth remembering**
- **`upToMessageId` is a UUID, not orderable** — we hop through it once to get the boundary's `createdAt`, then use that Date as the cutoff for `gt:` filters. Two queries instead of one, but no need to denormalize a timestamp into the Summary row.
- **Summary preface as a "user" turn**, not a second system message — Groq's chat API tolerates multiple system messages, but sticking to one system + history-shaped turns keeps the prompt easier to reason about.
- **Incremental summarization** — passing the existing summary in the *system* prompt (not as a chat turn) lets the model extend it without confusing itself about what's "old" vs "new" content.
- **`after()` for post-response background work** — Next.js 16 native. No queue, no cron. The summarization call runs on the same serverless invocation but after the response is flushed.

### Up next

Polish + deployment. Possible directions:
- **Document re-processing UI** — retry button for `failed` documents
- **Conversation list / rename / delete notebook flows** beyond Phase 2 dashboard
- **Source citations in chat** — link assistant claims back to the chunk source (we already number `[1]`, `[2]` in the system prompt)
- **Background ingestion** — move `ingestDocument` into `after()` so the upload action returns instantly instead of blocking on parse+embed
