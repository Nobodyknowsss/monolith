import { NotebookPen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";
import { NotebookCard } from "@/components/notebook/notebook-card";
import { NewNotebookDialog } from "@/components/notebook/new-notebook-dialog";

export default async function HomePage() {
  const user = await requireUser();

  const notebooks = await prisma.notebook.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { documents: true } } },
  });

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader userEmail={user.email ?? null} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        {notebooks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Your notebooks
                </h1>
                <p className="text-sm text-muted-foreground">
                  {notebooks.length}{" "}
                  {notebooks.length === 1 ? "notebook" : "notebooks"}
                </p>
              </div>
              <NewNotebookDialog />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notebooks.map((notebook) => (
                <NotebookCard key={notebook.id} notebook={notebook} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-teal-600 dark:text-teal-400">
        <NotebookPen
          aria-hidden="true"
          className="size-7"
          strokeWidth={1.5}
        />
      </div>
      <div className="max-w-sm space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          No notebooks yet
        </h1>
        <p className="text-sm text-muted-foreground">
          Create one to start adding documents and asking questions.
        </p>
      </div>
      <NewNotebookDialog triggerLabel="Create your first notebook" />
    </div>
  );
}
