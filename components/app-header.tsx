import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { logout } from "@/app/actions/auth";

type AppHeaderProps = {
  userEmail: string | null;
};

export function AppHeader({ userEmail }: AppHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="NoteMind home"
          className="cursor-pointer"
        >
          <BrandMark />
        </Link>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userEmail}
            </span>
          )}
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="cursor-pointer"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
