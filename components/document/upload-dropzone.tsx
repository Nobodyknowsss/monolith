"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocument } from "@/app/actions/documents";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.docx,.txt";
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

type Props = { notebookId: string };

export function UploadDropzone({ notebookId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(f: File): string | null {
    if (f.size === 0) return "File is empty";
    if (f.size > MAX_SIZE) return "File too large (max 10MB)";
    if (!ALLOWED_MIMES.includes(f.type))
      return "Unsupported file type — use PDF, DOCX, or TXT";
    return null;
  }

  function selectFile(f: File | null | undefined) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const v = validate(f);
    if (v) {
      setError(v);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
    selectFile(f ?? null);
  }

  function clear() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form action={uploadDocument} className="space-y-3">
      <input type="hidden" name="notebookId" value={notebookId} />

      <label
        htmlFor="document-file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-background px-4 py-6 text-center transition-colors",
          dragOver
            ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/30"
            : "border-border hover:bg-muted/40",
        )}
      >
        {file ? (
          <div className="flex items-center gap-2 text-sm">
            <FileText
              aria-hidden="true"
              className="size-4 text-teal-600 dark:text-teal-400"
            />
            <span className="font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </span>
          </div>
        ) : (
          <>
            <Upload
              aria-hidden="true"
              className="size-5 text-muted-foreground"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium">
              Drop a file or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, or TXT &middot; up to 10MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          id="document-file"
          type="file"
          name="file"
          accept={ACCEPT}
          required
          onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {file && <DropzoneActions onClear={clear} />}
    </form>
  );
}

function DropzoneActions({ onClear }: { onClear: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={pending}
        className="cursor-pointer"
      >
        <X aria-hidden="true" />
        Clear
      </Button>
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="flex-1 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2
              aria-hidden="true"
              className="size-3.5 animate-spin"
            />
            Processing…
          </>
        ) : (
          "Upload"
        )}
      </Button>
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
