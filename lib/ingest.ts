import { prisma } from "@/lib/prisma";
import { downloadFileFromStorage } from "@/lib/storage";
import { parseFile } from "@/lib/parsing";
import { chunkText } from "@/lib/chunking";
import { embed, EMBEDDING_DIM } from "@/lib/embeddings";

export async function ingestDocument(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, fileUrl: true, mimeType: true },
  });

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }
  if (!document.fileUrl) {
    throw new Error(`Document ${documentId} has no fileUrl`);
  }

  try {
    const buffer = await downloadFileFromStorage(document.fileUrl);
    const text = await parseFile(buffer, document.mimeType ?? "text/plain");
    const chunks = await chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No text could be extracted from the document");
    }

    const embeddings = await embed(chunks);

    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: ${embeddings.length} embeddings vs ${chunks.length} chunks`,
      );
    }

    // pgvector columns can't be written through the Prisma client because the
    // field is declared `Unsupported("vector(384)")`. We use $executeRaw with a
    // string-cast-to-vector. Prisma parameterizes each ${} so this is injection-safe.
    for (let i = 0; i < chunks.length; i++) {
      const vec = embeddings[i];
      if (vec.length !== EMBEDDING_DIM) {
        throw new Error(
          `Embedding dim mismatch: got ${vec.length}, expected ${EMBEDDING_DIM}`,
        );
      }
      const vectorLiteral = `[${vec.join(",")}]`;
      await prisma.$executeRaw`
        INSERT INTO "Chunk" (id, "text", embedding, "documentId", "chunkIndex", "createdAt")
        VALUES (gen_random_uuid(), ${chunks[i]}, ${vectorLiteral}::vector, ${document.id}::uuid, ${i}, now())
      `;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ready" },
    });
  } catch (error) {
    console.error(`[ingest] document ${documentId} failed:`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "failed" },
    });
    throw error;
  }
}
