import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";
import { DocumentsPane } from "@/components/document/documents-pane";
import { ChatPane } from "@/components/chat/chat-pane";

type NotebookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotebookPage({ params }: NotebookPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const notebook = await prisma.notebook.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      documents: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { chunks: true } } },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true },
      },
    },
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
            href="/dashboard"
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All notebooks
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {notebook.title}
          </h1>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
          <DocumentsPane
            notebookId={notebook.id}
            documents={notebook.documents}
          />
          <ChatPane
            notebookId={notebook.id}
            initialMessages={notebook.messages}
            hasReadyDocuments={notebook.documents.some(
              (d) => d.status === "ready",
            )}
          />
        </div>
      </main>
    </div>
  );
}
