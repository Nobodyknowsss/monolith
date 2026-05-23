import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotebookNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion
          className="size-7"
          aria-hidden="true"
          strokeWidth={1.5}
        />
      </div>
      <div className="max-w-sm space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Notebook not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This notebook doesn&rsquo;t exist, or you don&rsquo;t have access to
          it.
        </p>
      </div>
      <Link href="/dashboard" className={cn(buttonVariants(), "cursor-pointer")}>
        Back to your notebooks
      </Link>
    </div>
  );
}
