import { NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

export function BrandMark({
  className,
  size = "md",
  showWordmark = true,
}: BrandMarkProps) {
  const iconSize = size === "sm" ? 18 : size === "lg" ? 28 : 22;
  const text =
    size === "sm"
      ? "text-base"
      : size === "lg"
        ? "text-2xl"
        : "text-lg";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NotebookPen
        aria-hidden="true"
        size={iconSize}
        className="text-green-400"
        strokeWidth={2}
      />
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", text)}>
          Monolith
        </span>
      )}
    </div>
  );
}
