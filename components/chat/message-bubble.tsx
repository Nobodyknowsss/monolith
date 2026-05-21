import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: string;
  content: string;
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-secondary px-3.5 py-2 text-sm text-secondary-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-full whitespace-pre-wrap break-words px-1 text-sm leading-relaxed text-foreground">
        {content}
      </div>
    </div>
  );
}
