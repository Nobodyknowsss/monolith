"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/auth/submit-button";
import { createNotebook } from "@/app/actions/notebooks";

type NewNotebookDialogProps = {
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
};

export function NewNotebookDialog({
  triggerLabel = "New notebook",
  triggerVariant = "default",
}: NewNotebookDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} className="cursor-pointer" />
        }
      >
        <Plus aria-hidden="true" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New notebook</DialogTitle>
          <DialogDescription>
            Give it a name. You can add documents next.
          </DialogDescription>
        </DialogHeader>
        <form action={createNotebook} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder="Research notes, course Q3, …"
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                />
              }
            >
              Cancel
            </DialogClose>
            <SubmitButton pendingLabel="Creating…" className="w-full sm:w-auto">
              Create notebook
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
