import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" aria-label="NoteMind home">
            <BrandMark size="lg" />
          </Link>
          <p className="text-sm text-muted-foreground">
            Notes that answer back.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
