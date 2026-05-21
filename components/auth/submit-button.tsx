"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn("w-full cursor-pointer", className)}
    >
      {pending ? (
        <>
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin"
          />
          {pendingLabel ?? "Please wait"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
