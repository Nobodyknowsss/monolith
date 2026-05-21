import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MessageSquare, Upload } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";

type NotebookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotebookPage({ params }: NotebookPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const notebook = await prisma.notebook.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true, updatedAt: true },
  });

  if (!notebook) {
    notFound();
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader userEmail={user.email ?? null} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All notebooks
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {notebook.title}
          </h1>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="flex flex-col rounded-lg border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
              <FileText
                className="size-4 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              Documents
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Upload
                className="size-7 text-muted-foreground"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <p className="text-sm text-muted-foreground">
                No documents yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Upload coming in Phase 3.
              </p>
            </div>
          </aside>

          <section className="flex min-h-[480px] flex-col rounded-lg border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
              <MessageSquare
                className="size-4 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              Chat
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Add documents to start chatting.
              </p>
              <p className="text-xs text-muted-foreground">
                Chat coming in Phase 4.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
