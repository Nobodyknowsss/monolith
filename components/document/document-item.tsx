import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteDocumentDialog } from "@/components/document/delete-document-dialog";
import type { DocumentListItem } from "@/types/document";

type Props = { document: DocumentListItem };

const STATUS_STYLES: Record<DocumentListItem["status"], string> = {
  processing:
    "bg-amber-500/10 text-amber-300 ring-amber-400/30",
  ready:
    "bg-green-500/10 text-green-300 ring-green-400/30",
  failed: "bg-destructive/10 text-destructive ring-destructive/30",
};

const STATUS_LABELS: Record<DocumentListItem["status"], string> = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export function DocumentItem({ document }: Props) {
  const chunkCount = document._count?.chunks ?? 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <FileText
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={document.name}>
          {document.name}
        </p>
        {document.status === "ready" && (
          <p className="text-xs text-muted-foreground">
            {chunkCount} {chunkCount === 1 ? "chunk" : "chunks"}
          </p>
        )}
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
          STATUS_STYLES[document.status],
        )}
      >
        {STATUS_LABELS[document.status]}
      </span>
      <DeleteDocumentDialog
        documentId={document.id}
        documentName={document.name}
      />
    </div>
  );
}
