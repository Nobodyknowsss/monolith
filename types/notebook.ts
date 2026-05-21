import type { NotebookModel } from "@/generated/prisma/models";

export type NotebookListItem = NotebookModel & {
  _count: { documents: number };
};
