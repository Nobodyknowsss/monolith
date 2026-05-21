import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { message } = await searchParams;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </div>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {message ?? "We couldn't complete that action. Please try again."}
        </p>
        <Link
          href="/login"
          className={cn(buttonVariants(), "w-full cursor-pointer")}
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
