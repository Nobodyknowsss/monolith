"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const TITLE_MAX = 120;

export async function createNotebook(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    redirect("/error?message=Notebook+title+is+required");
  }
  if (title.length > TITLE_MAX) {
    redirect(`/error?message=Title+must+be+${TITLE_MAX}+characters+or+fewer`);
  }

  const notebook = await prisma.notebook.create({
    data: { title, userId: user.id },
  });

  revalidatePath("/");
  redirect(`/notebooks/${notebook.id}`);
}

export async function deleteNotebook(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  // deleteMany with userId in the WHERE clause does the ownership check
  // atomically in one query. If the user doesn't own it, count is 0 — no leak.
  // Cascade FKs handle Document → Chunk and Message + Summary cleanup.
  await prisma.notebook.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  redirect("/");
}
