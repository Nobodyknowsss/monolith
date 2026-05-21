import { createClient } from "@/lib/supabase/server";

export const STORAGE_BUCKET = "documents";

function storagePath(opts: {
  userId: string;
  notebookId: string;
  documentId: string;
  filename: string;
}) {
  const safeName = opts.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${opts.userId}/${opts.notebookId}/${opts.documentId}-${safeName}`;
}

export async function uploadFileToStorage(opts: {
  userId: string;
  notebookId: string;
  documentId: string;
  filename: string;
  contentType: string;
  bytes: ArrayBuffer | Uint8Array;
}) {
  const supabase = await createClient();
  const path = storagePath(opts);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, opts.bytes, {
      contentType: opts.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return path;
}

export async function downloadFileFromStorage(path: string): Promise<Buffer> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(path);

  if (error || !data) {
    throw new Error(
      `Storage download failed: ${error?.message ?? "no data returned"}`,
    );
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function deleteFileFromStorage(path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
