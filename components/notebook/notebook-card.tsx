import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotebookCardMenu } from "@/components/notebook/notebook-card-menu";
import { formatRelativeTime } from "@/lib/format";
import type { NotebookListItem } from "@/types/notebook";

type NotebookCardProps = {
  notebook: NotebookListItem;
};

export function NotebookCard({ notebook }: NotebookCardProps) {
  const docCount = notebook._count.documents;

  return (
    <Card className="group relative transition-colors hover:border-foreground/20">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <Link
          href={`/notebooks/${notebook.id}`}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <CardTitle className="line-clamp-2 break-words text-base">
            {notebook.title}
          </CardTitle>
        </Link>
        <NotebookCardMenu
          notebookId={notebook.id}
          notebookTitle={notebook.title}
        />
      </CardHeader>
      <CardContent>
        <Link
          href={`/notebooks/${notebook.id}`}
          className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5">
            <FileText aria-hidden="true" className="size-3.5" />
            {docCount} {docCount === 1 ? "document" : "documents"}
          </span>
          <span>{formatRelativeTime(notebook.updatedAt)}</span>
        </Link>
      </CardContent>
    </Card>
  );
}
