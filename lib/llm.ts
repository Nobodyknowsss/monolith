import Groq from "groq-sdk";
import type { RetrievedChunk } from "@/lib/vector-search";

// Groq free tier — no credit card, no billing setup. Llama 3.3 70B is fast
// on their custom hardware and competitive for RAG. Fallbacks if rate limits
// bite: llama-3.1-8b-instant (smaller, faster), gemma2-9b-it, mixtral-8x7b-32768.
const MODEL = "llama-3.3-70b-versatile";

// Sliding window for conversation memory: max prior turns sent to the LLM.
// 10 = roughly 5 user + 5 assistant exchanges, enough for natural follow-ups
// without bloating the prompt.
export const RECENT_WINDOW_SIZE = 10;

export type ChatTurn = { role: "user" | "assistant"; content: string };

let client: Groq | null = null;

function getClient(): Groq {
  if (client) return client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  client = new Groq({ apiKey });
  return client;
}

export function buildRagSystemPrompt(chunks: RetrievedChunk[]): string {
  const contextBlocks = chunks
    .map(
      (c, i) =>
        `[${i + 1}] From "${c.documentName}":\n${c.text.trim()}`,
    )
    .join("\n\n");

  return `You are a careful research assistant for the user's personal notebook. Answer the user's question strictly using only the provided context from their uploaded documents.

Rules:
- If the context does not contain enough information to answer, reply exactly: "I don't have enough information in the documents to answer that."
- Do not invent facts. Do not use outside knowledge.
- Be concise and direct.
- When helpful, refer to source documents by their file name.

<context>
${contextBlocks}
</context>`;
}

export async function* streamChatCompletion({
  system,
  history,
  previousSummary,
  maxTokens = 1024,
  temperature = 0.2,
}: {
  system: string;
  history: ChatTurn[];
  previousSummary?: string;
  maxTokens?: number;
  temperature?: number;
}): AsyncIterable<string> {
  const c = getClient();
  const summaryPreface: ChatTurn[] = previousSummary
    ? [
        {
          role: "user",
          content: `[Earlier in this conversation, summarized]:\n${previousSummary}`,
        },
      ]
    : [];
  const stream = await c.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      ...summaryPreface,
      ...history,
    ],
    stream: true,
    max_tokens: maxTokens,
    temperature,
  });

  for await (const chunk of stream) {
    const piece = chunk.choices[0]?.delta?.content ?? "";
    if (piece) yield piece;
  }
}
