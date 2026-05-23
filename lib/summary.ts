import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { RECENT_WINDOW_SIZE } from "@/lib/llm";

// Same model as the chat LLM — one provider to manage and Groq is cheap enough
// that there's no reason to downgrade for summarization.
const MODEL = "llama-3.3-70b-versatile";

// Below this many total messages we don't bother summarizing — the sliding
// window alone gives the model plenty of context.
export const SUMMARIZE_THRESHOLD = 20;

let client: Groq | null = null;

function getClient(): Groq {
  if (client) return client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  client = new Groq({ apiKey });
  return client;
}

export type SummarizableMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUMMARY_SYSTEM_PROMPT = `You are condensing the older portion of a conversation between a user and a research assistant who answers questions about the user's uploaded documents.

Produce a tight summary (3–5 short bullet points) capturing:
- Topics the user asked about
- Key facts the assistant established from the documents
- Any threads or decisions the user is following

Do not repeat the assistant's "I don't have enough information" replies verbatim. Be terse. Do not invent details that aren't in the transcript.`;

export async function summarizeMessages(
  messages: SummarizableMessage[],
  previousSummary?: string,
): Promise<string> {
  if (messages.length === 0) return previousSummary?.trim() ?? "";

  const transcript = messages
    .map(
      (m) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content.trim()}`,
    )
    .join("\n\n");

  const system = previousSummary
    ? `${SUMMARY_SYSTEM_PROMPT}\n\nYou already have this running summary of earlier turns. Extend or revise it to incorporate the new messages below; keep the same 3–5 bullet format.\n\n<existing-summary>\n${previousSummary}\n</existing-summary>`
    : SUMMARY_SYSTEM_PROMPT;

  const c = getClient();
  const completion = await c.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: previousSummary
          ? `New messages to fold in:\n\n${transcript}`
          : `Summarize this conversation:\n\n${transcript}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// Incrementally extends the per-notebook Summary row. Safe to call on every
// chat turn — short-circuits when there's nothing new to summarize.
//
// Strategy: anything older than the most recent RECENT_WINDOW_SIZE messages
// and not yet covered by the existing summary gets folded in. The existing
// summary (if any) is passed as context so the model extends instead of
// re-summarizing the same material from scratch.
export async function updateNotebookSummary(notebookId: string): Promise<void> {
  const existing = await prisma.summary.findUnique({
    where: { notebookId },
    select: { content: true, upToMessageId: true },
  });

  let cutoff: Date | null = null;
  if (existing?.upToMessageId) {
    const boundary = await prisma.message.findUnique({
      where: { id: existing.upToMessageId },
      select: { createdAt: true },
    });
    cutoff = boundary?.createdAt ?? null;
  }

  // All messages not yet covered by the summary, oldest-first.
  const uncovered = await prisma.message.findMany({
    where: {
      notebookId,
      ...(cutoff ? { createdAt: { gt: cutoff } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  // Only summarize messages that have already fallen out of the recent
  // window — anything inside the window is still sent verbatim to the LLM.
  if (uncovered.length <= RECENT_WINDOW_SIZE) return;

  const toFold = uncovered.slice(0, uncovered.length - RECENT_WINDOW_SIZE);
  const lastFolded = toFold[toFold.length - 1];

  const newSummary = await summarizeMessages(
    toFold.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    existing?.content,
  );

  if (!newSummary) return;

  await prisma.summary.upsert({
    where: { notebookId },
    create: {
      notebookId,
      content: newSummary,
      upToMessageId: lastFolded.id,
    },
    update: {
      content: newSummary,
      upToMessageId: lastFolded.id,
    },
  });
}
