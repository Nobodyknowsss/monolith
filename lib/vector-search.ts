import { prisma } from "@/lib/prisma";

export type RetrievedChunk = {
  id: string;
  text: string;
  documentId: string;
  documentName: string;
};

/**
 * Cosine-distance similarity search across the user's chunks in one notebook.
 *
 * Ownership is enforced inside the SQL (JOIN through Notebook with both
 * notebook id AND user id), so callers cannot accidentally retrieve someone
 * else's data even if they pass a foreign notebookId.
 *
 * Only chunks belonging to `status = 'ready'` documents are searched.
 */
export async function findSimilarChunks({
  notebookId,
  userId,
  queryEmbedding,
  k = 5,
}: {
  notebookId: string;
  userId: string;
  queryEmbedding: number[];
  k?: number;
}): Promise<RetrievedChunk[]> {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const rows = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT c.id, c."text", c."documentId", d.name AS "documentName"
    FROM "Chunk" c
    INNER JOIN "Document" d ON d.id = c."documentId"
    INNER JOIN "Notebook" n ON n.id = d."notebookId"
    WHERE n.id = ${notebookId}::uuid
      AND n."userId" = ${userId}::uuid
      AND d.status = 'ready'
    ORDER BY c.embedding <=> ${vectorLiteral}::vector
    LIMIT ${k}
  `;

  return rows;
}
