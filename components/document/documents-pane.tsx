import { FileText } from "lucide-react";
import { UploadDropzone } from "@/components/document/upload-dropzone";
import { DocumentList } from "@/components/document/document-list";
import type { DocumentListItem } from "@/types/document";

type Props = {
  notebookId: string;
  documents: DocumentListItem[];
};

export function DocumentsPane({ notebookId, documents }: Props) {
  return (
    <aside className="flex flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText
            aria-hidden="true"
            className="size-4 text-teal-600 dark:text-teal-400"
          />
          Documents
        </div>
        {documents.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {documents.length}
          </span>
        )}
      </div>
      <div className="space-y-3 p-3">
        {/*
          key={documents.length} forces a fresh mount of the dropzone after every
          upload (success OR failure — both add a row). That clears the residual
          file preview / pending spinner that otherwise lingers after redirect.
        */}
        <UploadDropzone key={documents.length} notebookId={notebookId} />
        <DocumentList documents={documents} />
      </div>
    </aside>
  );
}
