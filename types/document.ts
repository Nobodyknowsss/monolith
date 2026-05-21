import type { DocumentModel } from "@/generated/prisma/models";

export type DocumentListItem = DocumentModel & {
  _count: { chunks: number };
};
