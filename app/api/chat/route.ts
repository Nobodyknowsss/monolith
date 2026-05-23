import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { embed } from "@/lib/embeddings";
import { findSimilarChunks } from "@/lib/vector-search";
import {
  buildRagSystemPrompt,
  streamChatCompletion,
  RECENT_WINDOW_SIZE,
  type ChatTurn,
} from "@/lib/llm";
import {
  SUMMARIZE_THRESHOLD,
  updateNotebookSummary,
} from "@/lib/summary";

export const maxDuration = 60;

type ChatBody = { notebookId?: string; question?: string };

export async function POST(request: Request) {
  const user = await requireUser();

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const notebookId = body.notebookId;
  const question = body.question?.trim();

  if (!notebookId || !question) {
    return NextResponse.json(
      { error: "notebookId and question are required" },
      { status: 400 },
    );
  }

  // Ownership check
  const notebook = await prisma.notebook.findFirst({
    where: { id: notebookId, userId: user.id },
    select: { id: true },
  });
  if (!notebook) {
    return NextResponse.json(
      { error: "Notebook not found" },
      { status: 404 },
    );
  }

  // Must have at least one Ready document to answer from
  const readyCount = await prisma.document.count({
    where: { notebookId, status: "ready" },
  });
  if (readyCount === 0) {
    return NextResponse.json(
      {
        error:
          "No documents are ready yet. Upload one and wait for it to finish processing.",
      },
      { status: 400 },
    );
  }

  // Persist the user message first so it's always preserved in chat history,
  // even if embedding/LLM fails downstream.
  await prisma.message.create({
    data: { notebookId, role: "user", content: question },
  });

  // Embed + retrieve
  let queryEmbedding: number[];
  try {
    const embeddings = await embed([question]);
    queryEmbedding = embeddings[0];
  } catch (err) {
    console.error("[chat] embedding failed:", err);
    return NextResponse.json(
      { error: "Failed to process question. Please try again." },
      { status: 502 },
    );
  }

  const chunks = await findSimilarChunks({
    notebookId,
    userId: user.id,
    queryEmbedding,
    k: 5,
  });

  // No matching chunks (very unlikely with cosine, possible if all docs are empty)
  if (chunks.length === 0) {
    const fallback =
      "I couldn't find anything in your documents related to that question.";
    await prisma.message.create({
      data: { notebookId, role: "assistant", content: fallback },
    });
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const system = buildRagSystemPrompt(chunks);

  // Load the running summary (if any) and translate its upToMessageId boundary
  // into a createdAt cutoff so the sliding window doesn't replay already-
  // summarized turns.
  const summary = await prisma.summary.findUnique({
    where: { notebookId },
    select: { content: true, upToMessageId: true },
  });
  let cutoff: Date | null = null;
  if (summary?.upToMessageId) {
    const boundary = await prisma.message.findUnique({
      where: { id: summary.upToMessageId },
      select: { createdAt: true },
    });
    cutoff = boundary?.createdAt ?? null;
  }

  // Sliding-window history: pull the last N messages newer than the cutoff
  // (newest-first), reverse to oldest-first. Includes the user message we
  // just persisted as the final turn.
  const recent = await prisma.message.findMany({
    where: {
      notebookId,
      ...(cutoff ? { createdAt: { gt: cutoff } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_WINDOW_SIZE,
    select: { role: true, content: true },
  });
  const history: ChatTurn[] = recent
    .reverse()
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const piece of streamChatCompletion({
          system,
          history,
          previousSummary: summary?.content ?? undefined,
        })) {
          fullText += piece;
          controller.enqueue(encoder.encode(piece));
        }
      } catch (err) {
        console.error("[chat] streaming failed:", err);
        // Fall through to persist what we have + close cleanly. The client
        // will see whatever partial text already arrived.
      } finally {
        if (fullText.trim()) {
          try {
            await prisma.message.create({
              data: {
                notebookId,
                role: "assistant",
                content: fullText,
              },
            });
          } catch (err) {
            console.error("[chat] failed to persist assistant message:", err);
          }
        }
        controller.close();

        // After the response is delivered, check whether this notebook has
        // grown past the threshold and extend its rolling summary if so.
        // Runs after() the response is flushed so the user never waits on it.
        after(async () => {
          try {
            const total = await prisma.message.count({ where: { notebookId } });
            if (total > SUMMARIZE_THRESHOLD) {
              await updateNotebookSummary(notebookId);
            }
          } catch (err) {
            console.error("[chat] summary update failed:", err);
          }
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
