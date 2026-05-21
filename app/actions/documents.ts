"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  uploadFileToStorage,
  deleteFileFromStorage,
} from "@/lib/storage";
import { ingestDocument } from "@/lib/ingest";
import { isSupportedMimeType } from "@/lib/parsing";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadDocument(formData: FormData) {
  const user = await requireUser();

  const notebookId = String(formData.get("notebookId") ?? "");
  const file = formData.get("file");

  if (!notebookId || !(file instanceof File)) {
    redirect("/error?message=Missing+file+or+notebook");
  }

  const notebook = await prisma.notebook.findFirst({
    where: { id: notebookId, userId: user.id },
    select: { id: true },
  });
  if (!notebook) {
    redirect("/error?message=Notebook+not+found");
  }

  if (file.size === 0) {
    redirect("/error?message=File+is+empty");
  }
  if (file.size > MAX_FILE_SIZE) {
    redirect("/error?message=File+too+large+(max+10MB)");
  }
  if (!isSupportedMimeType(file.type)) {
    redirect("/error?message=Unsupported+file+type.+Use+PDF,+DOCX,+or+TXT");
  }

  // Create the Document row first so ingestion has a row to mark
  // ready/failed even if upload itself fails partway.
  const document = await prisma.document.create({
    data: {
      name: file.name,
      mimeType: file.type,
      fileUrl: "",
      notebookId: notebook.id,
      status: "processing",
    },
  });

  try {
    const path = await uploadFileToStorage({
      userId: user.id,
      notebookId: notebook.id,
      documentId: document.id,
      filename: file.name,
      contentType: file.type,
      bytes: await file.arrayBuffer(),
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { fileUrl: path },
    });

    await ingestDocument(document.id);
  } catch (error) {
    console.error("[upload] failed:", error);
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "failed" },
    });
  }

  revalidatePath(`/notebooks/${notebookId}`);
  redirect(`/notebooks/${notebookId}`);
}

export async function deleteDocument(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Ownership check via JOIN — only finds docs whose notebook belongs to the user.
  const document = await prisma.document.findFirst({
    where: { id, notebook: { userId: user.id } },
    select: { id: true, fileUrl: true, notebookId: true },
  });

  if (!document) return;

  if (document.fileUrl) {
    try {
      await deleteFileFromStorage(document.fileUrl);
    } catch (error) {
      // Don't block DB cleanup if storage delete fails — a stray orphan file
      // is better than a half-deleted document row.
      console.error("[delete] storage cleanup failed (continuing):", error);
    }
  }

  await prisma.document.delete({ where: { id: document.id } });

  revalidatePath(`/notebooks/${document.notebookId}`);
}
